#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Custom Security Audit Script
 * Checks for common security issues in the codebase
 */

class SecurityAuditor {
  constructor() {
    this.issues = []
    this.scannedFiles = 0
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /coverage/,
      /test-results/,
      /playwright-report/,
      /\.env\.example/,
    ]
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  addIssue(file, line, issue, severity = 'medium') {
    this.issues.push({
      file,
      line,
      issue,
      severity,
      timestamp: new Date().toISOString(),
    })
  }

  shouldExcludeFile(filePath) {
    return this.excludePatterns.some(pattern => pattern.test(filePath))
  }

  checkEnvironmentVariables(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for hardcoded API keys or secrets
      const secretPatterns = [
        /api[_-]?key\s*=\s*['"][^'"]{10,}['"]/i,
        /secret\s*=\s*['"][^'"]{10,}['"]/i,
        /password\s*=\s*['"][^'"]+['"]/i,
        /token\s*=\s*['"][^'"]{20,}['"]/i,
        /sk-[a-zA-Z0-9]{20,}/,  // OpenAI API key pattern
        /xoxb-[a-zA-Z0-9-]+/,   // Slack bot token pattern
        /ghp_[a-zA-Z0-9]{36}/,  // GitHub personal access token
      ]

      secretPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('example') && !line.includes('placeholder')) {
          this.addIssue(
            filePath,
            index + 1,
            'Potential hardcoded secret or API key detected',
            'high'
          )
        }
      })

      // Check for missing environment variable validation
      if (line.includes('process.env.') && !line.includes('||') && !line.includes('??')) {
        const envVar = line.match(/process\.env\.([A-Z_]+)/)?.[1]
        if (envVar && !line.includes('NODE_ENV')) {
          this.addIssue(
            filePath,
            index + 1,
            `Environment variable ${envVar} used without fallback or validation`,
            'medium'
          )
        }
      }
    })
  }

  checkSQLInjection(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for potential SQL injection vulnerabilities
      const sqlPatterns = [
        /\$\{[^}]*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
        /['"`]\s*\+\s*.*\s*\+\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE)/i,
        /query\s*\(\s*['"`][^'"`]*\$\{/i,
      ]

      sqlPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue(
            filePath,
            index + 1,
            'Potential SQL injection vulnerability detected',
            'high'
          )
        }
      })
    })
  }

  checkXSS(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for potential XSS vulnerabilities
      const xssPatterns = [
        /dangerouslySetInnerHTML/,
        /innerHTML\s*=\s*[^;]*\+/,
        /document\.write\s*\(/,
        /eval\s*\(/,
        /new\s+Function\s*\(/,
      ]

      xssPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue(
            filePath,
            index + 1,
            'Potential XSS vulnerability detected',
            'high'
          )
        }
      })
    })
  }

  checkInsecureRandomness(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for insecure random number generation
      if (line.includes('Math.random()') && 
          (line.includes('password') || line.includes('token') || line.includes('secret'))) {
        this.addIssue(
          filePath,
          index + 1,
          'Insecure random number generation for security-sensitive operation',
          'medium'
        )
      }
    })
  }

  checkInsecureHTTP(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for insecure HTTP usage
      if (line.includes('http://') && !line.includes('localhost') && !line.includes('127.0.0.1')) {
        this.addIssue(
          filePath,
          index + 1,
          'Insecure HTTP protocol used instead of HTTPS',
          'medium'
        )
      }
    })
  }

  checkFilePermissions(content, filePath) {
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Check for overly permissive file operations
      const permissionPatterns = [
        /chmod\s+777/,
        /fs\.chmod.*0o777/,
        /fs\.writeFile.*{.*mode.*0o777/,
      ]

      permissionPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue(
            filePath,
            index + 1,
            'Overly permissive file permissions detected',
            'medium'
          )
        }
      })
    })
  }

  scanFile(filePath) {
    if (this.shouldExcludeFile(filePath)) {
      return
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      this.scannedFiles++

      // Run all security checks
      this.checkEnvironmentVariables(content, filePath)
      this.checkSQLInjection(content, filePath)
      this.checkXSS(content, filePath)
      this.checkInsecureRandomness(content, filePath)
      this.checkInsecureHTTP(content, filePath)
      this.checkFilePermissions(content, filePath)

    } catch (error) {
      this.log(`Error scanning file ${filePath}: ${error.message}`, 'error')
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath)
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath)
        } else if (stat.isFile()) {
          // Only scan relevant file types
          const ext = path.extname(fullPath).toLowerCase()
          const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env']
          
          if (relevantExtensions.includes(ext) || item.startsWith('.env')) {
            this.scanFile(fullPath)
          }
        }
      }
    } catch (error) {
      this.log(`Error scanning directory ${dirPath}: ${error.message}`, 'error')
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      scannedFiles: this.scannedFiles,
      totalIssues: this.issues.length,
      issuesBySeverity: {
        high: this.issues.filter(i => i.severity === 'high').length,
        medium: this.issues.filter(i => i.severity === 'medium').length,
        low: this.issues.filter(i => i.severity === 'low').length,
      },
      issues: this.issues,
    }

    // Write report to file
    const reportPath = path.join(process.cwd(), 'security-audit-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    return report
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60))
    console.log('🔒 SECURITY AUDIT SUMMARY')
    console.log('='.repeat(60))
    console.log(`📁 Files scanned: ${report.scannedFiles}`)
    console.log(`🚨 Total issues found: ${report.totalIssues}`)
    console.log(`🔴 High severity: ${report.issuesBySeverity.high}`)
    console.log(`🟡 Medium severity: ${report.issuesBySeverity.medium}`)
    console.log(`🟢 Low severity: ${report.issuesBySeverity.low}`)
    
    if (report.totalIssues > 0) {
      console.log('\n📋 ISSUES FOUND:')
      console.log('-'.repeat(60))
      
      report.issues.forEach((issue, index) => {
        const severityIcon = issue.severity === 'high' ? '🔴' : 
                           issue.severity === 'medium' ? '🟡' : '🟢'
        console.log(`${index + 1}. ${severityIcon} ${issue.file}:${issue.line}`)
        console.log(`   ${issue.issue}`)
        console.log('')
      })
      
      console.log(`📄 Detailed report saved to: security-audit-report.json`)
    } else {
      console.log('\n✅ No security issues found!')
    }
    
    console.log('='.repeat(60))
  }

  run() {
    this.log('Starting security audit...', 'info')
    
    const startTime = Date.now()
    const projectRoot = process.cwd()
    
    this.scanDirectory(projectRoot)
    
    const report = this.generateReport()
    const duration = Date.now() - startTime
    
    this.log(`Security audit completed in ${duration}ms`, 'info')
    this.printSummary(report)
    
    // Exit with error code if high severity issues found
    if (report.issuesBySeverity.high > 0) {
      process.exit(1)
    }
  }
}

// Run the security audit
if (require.main === module) {
  const auditor = new SecurityAuditor()
  auditor.run()
}

module.exports = SecurityAuditor 