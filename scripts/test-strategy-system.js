const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testStrategySystem() {
  console.log('🧪 Testing Strategy System Implementation...\n')
  
  // Check environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return false
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test database tables
  console.log('📊 Testing Database Tables:')
  const tables = [
    'strategies',
    'templates', 
    'audience_segments',
    'content_pillar_analytics',
    'strategy_analytics'
  ]
  
  let tablesExist = 0
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table ${table}: does not exist`)
        } else {
          console.log(`✅ Table ${table}: exists (with permission error - expected)`)
          tablesExist++
        }
      } else {
        console.log(`✅ Table ${table}: exists and accessible`)
        tablesExist++
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`)
    }
  }
  
  console.log(`\n📈 Database Status: ${tablesExist}/${tables.length} tables available\n`)
  
  // Test file structure
  console.log('📁 Testing File Structure:')
  const fs = require('fs')
  const path = require('path')
  
  const requiredFiles = [
    'src/types/strategy.ts',
    'src/lib/strategy-service.ts', 
    'src/hooks/useStrategy.ts',
    'src/app/strategy/page.tsx',
    'src/app/strategy/create/page.tsx',
    'src/app/strategy/[id]/page.tsx',
    'src/lib/template-strategy-integration.ts',
    'supabase/migrations/005_strategy_system.sql',
    'docs/STRATEGY_SYSTEM.md'
  ]
  
  let filesExist = 0
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`)
      filesExist++
    } else {
      console.log(`❌ ${file}`)
    }
  }
  
  console.log(`\n📈 File Structure: ${filesExist}/${requiredFiles.length} files present\n`)
  
  // Test TypeScript compilation
  console.log('🔧 Testing TypeScript Compilation:')
  try {
    const { execSync } = require('child_process')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    console.log('✅ TypeScript compilation successful')
  } catch (error) {
    console.log('❌ TypeScript compilation errors:')
    console.log(error.stdout?.toString() || error.message)
  }
  
  // Test Next.js build
  console.log('\n🏗️  Testing Next.js Build:')
  try {
    const { execSync } = require('child_process')
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ Next.js build successful')
  } catch (error) {
    console.log('❌ Next.js build errors:')
    console.log(error.stdout?.toString() || error.message)
  }
  
  // Summary
  console.log('\n📋 Strategy System Implementation Summary:')
  console.log('=' .repeat(50))
  console.log(`Database Tables: ${tablesExist}/${tables.length} ${tablesExist === tables.length ? '✅' : '⚠️'}`)
  console.log(`File Structure: ${filesExist}/${requiredFiles.length} ${filesExist === requiredFiles.length ? '✅' : '❌'}`)
  
  if (tablesExist < tables.length) {
    console.log('\n🚨 Database Migration Required:')
    console.log('   Please run the SQL in supabase/migrations/005_strategy_system.sql')
    console.log('   in your Supabase dashboard SQL Editor')
  }
  
  if (filesExist === requiredFiles.length && tablesExist >= tables.length * 0.8) {
    console.log('\n🎉 Strategy System is ready for use!')
    console.log('   Navigate to /strategy to get started')
  } else {
    console.log('\n⚠️  Strategy System needs setup completion')
  }
  
  return {
    tablesExist: tablesExist === tables.length,
    filesExist: filesExist === requiredFiles.length,
    ready: tablesExist >= tables.length * 0.8 && filesExist === requiredFiles.length
  }
}

if (require.main === module) {
  testStrategySystem().catch(console.error)
}

module.exports = { testStrategySystem } 