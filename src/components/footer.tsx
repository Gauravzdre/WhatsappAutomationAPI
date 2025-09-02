import Link from 'next/link'
import { Shield, Mail, Github, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              WhatsApp Automation Platform
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              AI-powered automation for WhatsApp Business, social media management, and content generation. 
              Streamline your business communications with intelligent automation.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:support@auto.netlify.app"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/oauth-demo" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  OAuth Demo
                </Link>
              </li>
              <li>
                <Link 
                  href="/settings" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </li>
              <li>
                <Link 
                  href="/templates" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/data-deletion" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  Data Deletion
                </Link>
              </li>
              <li>
                <a
                  href="mailto:privacy@auto.netlify.app"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@auto.netlify.app"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@auto.netlify.app"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 WhatsApp Automation Platform. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <Link 
              href="/data-deletion" 
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Data Deletion
            </Link>
            <a
              href="mailto:privacy@auto.netlify.app"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy
            </a>
            <a
              href="mailto:support@auto.netlify.app"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
