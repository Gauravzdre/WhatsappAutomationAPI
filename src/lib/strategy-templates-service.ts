import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { StrategyTemplateData, Strategy } from '@/types/strategy'
import { strategyService } from './strategy-service'

export class StrategyTemplatesService {
  private supabase = createClientComponentClient()

  /**
   * Get all available strategy templates
   */
  async getStrategyTemplates(): Promise<StrategyTemplateData[]> {
    try {
      const { data: templates, error } = await this.supabase
        .from('strategy_templates')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching strategy templates:', error)
        // Return hardcoded templates as fallback
        return this.getHardcodedTemplates()
      }

      return templates || this.getHardcodedTemplates()
    } catch (error) {
      console.error('Error in getStrategyTemplates:', error)
      // Return hardcoded templates as fallback
      return this.getHardcodedTemplates()
    }
  }

  /**
   * Get templates filtered by industry
   */
  async getTemplatesByIndustry(industry: string): Promise<StrategyTemplateData[]> {
    try {
      const { data: templates, error } = await this.supabase
        .from('strategy_templates')
        .select('*')
        .eq('industry', industry)
        .order('name')

      if (error) {
        console.error('Error fetching templates by industry:', error)
        return this.getHardcodedTemplates().filter(t => t.industry === industry)
      }

      return templates || []
    } catch (error) {
      console.error('Error in getTemplatesByIndustry:', error)
      return this.getHardcodedTemplates().filter(t => t.industry === industry)
    }
  }

  /**
   * Get templates filtered by business type
   */
  async getTemplatesByBusinessType(businessType: string): Promise<StrategyTemplateData[]> {
    try {
      const { data: templates, error } = await this.supabase
        .from('strategy_templates')
        .select('*')
        .eq('business_type', businessType)
        .order('name')

      if (error) {
        console.error('Error fetching templates by business type:', error)
        return this.getHardcodedTemplates().filter(t => t.business_type === businessType)
      }

      return templates || []
    } catch (error) {
      console.error('Error in getTemplatesByBusinessType:', error)
      return this.getHardcodedTemplates().filter(t => t.business_type === businessType)
    }
  }

  /**
   * Create a strategy from a template
   */
  async createStrategyFromTemplate(
    templateId: string, 
    customizations?: Partial<Strategy>
  ): Promise<Strategy> {
    try {
      // Get the template
      const { data: template, error } = await this.supabase
        .from('strategy_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) {
        console.error('Error fetching template:', error)
        // Try to find in hardcoded templates
        const hardcodedTemplate = this.getHardcodedTemplates().find(t => t.id === templateId)
        if (!hardcodedTemplate) {
          throw new Error('Template not found')
        }
        return this.createStrategyFromTemplateData(hardcodedTemplate, customizations)
      }

      return this.createStrategyFromTemplateData(template, customizations)
    } catch (error) {
      console.error('Error creating strategy from template:', error)
      throw error
    }
  }

  /**
   * Create strategy from template data
   */
  private async createStrategyFromTemplateData(
    template: StrategyTemplateData,
    customizations?: Partial<Strategy>
  ): Promise<Strategy> {
    const strategyData: Partial<Strategy> = {
      name: customizations?.name || `${template.name} - My Strategy`,
      description: customizations?.description || template.description,
      business_objectives: customizations?.business_objectives || template.business_objectives,
      target_metrics: customizations?.target_metrics || template.target_metrics,
      content_distribution: customizations?.content_distribution || template.content_distribution,
      status: customizations?.status || 'draft',
      ...customizations
    }

    return await strategyService.createStrategy(strategyData)
  }

  /**
   * Hardcoded templates as fallback when database is not available
   */
  private getHardcodedTemplates(): StrategyTemplateData[] {
    return [
      {
        id: 'ecommerce-growth',
        name: 'E-commerce Growth Strategy',
        description: 'Comprehensive strategy for online stores focusing on customer acquisition, retention, and sales conversion through engaging product showcases and customer support.',
        industry: 'Retail/E-commerce',
        business_type: 'Online Store',
        business_objectives: {
          primary_goal: 'Increase online sales and customer lifetime value through strategic messaging and customer engagement',
          secondary_goals: ['Build brand loyalty', 'Reduce cart abandonment', 'Increase repeat purchases', 'Generate product reviews'],
          target_audience: 'Online shoppers aged 25-45 looking for quality products and excellent customer service',
          value_proposition: 'Curated products, exceptional customer service, and personalized shopping experience',
          key_challenges: ['High competition', 'Customer acquisition cost', 'Building trust online', 'Managing customer expectations']
        },
        target_metrics: {
          response_rate_target: 28,
          engagement_rate_target: 18,
          conversion_rate_target: 12,
          monthly_message_target: 200
        },
        content_distribution: {
          educational: 35,
          promotional: 35,
          engagement: 20,
          support: 10
        },
        sample_content: {
          educational: [
            "💡 Pro Tip: Did you know that {{product_tip}}? Here's how to get the most out of your purchase!",
            "🔍 Product Spotlight: Learn about the features that make {{product_name}} special and why customers love it.",
            "📚 How-to Guide: Step-by-step instructions for {{product_usage}} to help you achieve the best results."
          ],
          promotional: [
            "🛍️ Limited Time: Get {{discount}}% off {{product_name}}! Perfect for {{use_case}}. Shop now: {{link}}",
            "✨ New Arrival Alert! Introducing {{product_name}} - now available with free shipping. Order today!",
            "🏷️ Flash Sale: Save big on {{category}} products. {{hours}} hours left! Don't miss out: {{link}}"
          ],
          engagement: [
            "🤔 Quick Question: What's your favorite {{product_category}}? We'd love to hear your thoughts!",
            "📸 Show & Tell: Share a photo of your {{product_name}} in action! Tag us for a chance to be featured.",
            "🎯 Poll Time: Which {{option_1}} or {{option_2}} would you prefer? Help us decide what to stock next!"
          ],
          support: [
            "🔧 Need help with your order? I'm here to assist! Just reply with your order number and I'll get you sorted.",
            "📦 Tracking Update: Your order {{order_number}} is on its way! Expected delivery: {{date}}",
            "❓ Have questions about {{product_name}}? I'm here to help you make the right choice!"
          ]
        },
        recommended_posting_schedule: {
          optimal_times: ['09:00', '13:00', '19:00'],
          frequency: 'daily',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          avoid_times: ['late_night', 'very_early_morning']
        },
        target_audience_profile: {
          age_range: '25-45',
          interests: ['online shopping', 'product reviews', 'deals and discounts', 'quality products'],
          behavior: 'Research-oriented shoppers who value convenience and customer service',
          communication_style: 'Appreciates clear product information, quick responses, and personalized recommendations'
        },
        brand_voice: 'friendly',
        tags: ['ecommerce', 'retail', 'sales', 'customer-service', 'growth'],
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'professional-services',
        name: 'Professional Services Authority Building',
        description: 'Establish thought leadership and build trust with potential clients through educational content, expertise sharing, and relationship building.',
        industry: 'Professional Services',
        business_type: 'Consulting/Agency',
        business_objectives: {
          primary_goal: 'Establish thought leadership and generate qualified leads through valuable content and expert positioning',
          secondary_goals: ['Build professional network', 'Increase referrals', 'Enhance reputation', 'Educate market'],
          target_audience: 'Business owners and decision-makers seeking professional expertise and reliable service providers',
          value_proposition: 'Deep industry expertise, proven results, and personalized professional service',
          key_challenges: ['Standing out from competitors', 'Demonstrating ROI', 'Building trust remotely', 'Explaining complex services']
        },
        target_metrics: {
          response_rate_target: 35,
          engagement_rate_target: 25,
          conversion_rate_target: 8,
          monthly_message_target: 120
        },
        content_distribution: {
          educational: 50,
          promotional: 20,
          engagement: 20,
          support: 10
        },
        sample_content: {
          educational: [
            "📊 Industry Insight: {{trend_statistic}} - Here's what this means for your business and how to adapt.",
            "💼 Expert Tip: The #1 mistake I see businesses make in {{service_area}} and how to avoid it.",
            "📈 Case Study: How we helped {{client_type}} achieve {{result}} in just {{timeframe}}. The strategy behind it..."
          ],
          promotional: [
            "🎯 Ready to {{achieve_goal}}? Let's discuss how our {{service}} can help you get there. Schedule a free consultation.",
            "✅ Special Offer: Complimentary {{service_type}} assessment for the next {{number}} businesses. Limited spots available.",
            "🚀 Success Story: {{client_name}} saw {{result}} after working with us. Ready for similar results? Let's talk."
          ],
          engagement: [
            "🤔 Question for business owners: What's your biggest challenge with {{business_area}} right now?",
            "💭 Thought Leadership: I've been thinking about {{industry_topic}}. What's your take on this trend?",
            "🗣️ Let's discuss: What strategies have you found most effective for {{business_challenge}}?"
          ],
          support: [
            "📞 Need clarification on {{service_topic}}? I'm here to explain and help you understand your options.",
            "📋 Follow-up: How is the {{project_name}} progressing? Any questions or adjustments needed?",
            "🔍 Resource: Here's a helpful guide about {{topic}} that answers common questions I receive."
          ]
        },
        recommended_posting_schedule: {
          optimal_times: ['08:00', '12:00', '17:00'],
          frequency: '3-4 times per week',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          avoid_times: ['weekends', 'early_morning', 'late_evening']
        },
        target_audience_profile: {
          age_range: '30-55',
          interests: ['business growth', 'industry trends', 'professional development', 'ROI optimization'],
          behavior: 'Analytical decision-makers who research thoroughly before engaging services',
          communication_style: 'Prefers professional, data-driven communication with clear value propositions'
        },
        brand_voice: 'professional',
        tags: ['b2b', 'consulting', 'professional-services', 'thought-leadership', 'lead-generation'],
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'health-wellness',
        name: 'Health & Wellness Community Building',
        description: 'Build a supportive community around health and wellness through motivation, education, and personal transformation stories.',
        industry: 'Health & Wellness',
        business_type: 'Fitness/Wellness Coach',
        business_objectives: {
          primary_goal: 'Build an engaged wellness community and help people achieve their health goals through motivation and education',
          secondary_goals: ['Increase client retention', 'Build brand awareness', 'Generate referrals', 'Create wellness advocates'],
          target_audience: 'Health-conscious individuals seeking guidance, motivation, and community support for their wellness journey',
          value_proposition: 'Personalized wellness guidance, supportive community, and sustainable lifestyle transformation',
          key_challenges: ['Maintaining motivation', 'Personalizing advice', 'Proving long-term results', 'Competing with quick fixes']
        },
        target_metrics: {
          response_rate_target: 32,
          engagement_rate_target: 22,
          conversion_rate_target: 10,
          monthly_message_target: 180
        },
        content_distribution: {
          educational: 45,
          promotional: 25,
          engagement: 25,
          support: 5
        },
        sample_content: {
          educational: [
            "🌱 Wellness Tip: {{health_tip}} - Small changes that make a big difference in your daily energy levels.",
            "🍎 Nutrition Facts: Why {{food_item}} is perfect for {{health_goal}} and how to incorporate it into your routine.",
            "💪 Workout Wednesday: Here's a simple {{exercise_type}} routine you can do in just {{minutes}} minutes at home."
          ],
          promotional: [
            "🎯 Ready to transform your health? Join our {{program_name}} and get {{benefit}}. Limited spots available!",
            "📅 Special Launch: New {{service_type}} program starting {{date}}. Early bird pricing ends soon!",
            "✨ Success Package: Everything you need for {{health_goal}} in one comprehensive program. Learn more: {{link}}"
          ],
          engagement: [
            "💬 Community Question: What's your biggest wellness challenge right now? Let's problem-solve together!",
            "🏆 Motivation Monday: Share your weekend wellness win! Even small victories count and inspire others.",
            "🤔 Quick Poll: Morning workouts or evening sessions? What works best for your schedule and energy?"
          ],
          support: [
            "🤗 Feeling stuck? Remember, progress isn't always linear. Here are 3 ways to get back on track...",
            "📞 Need help adjusting your {{plan_type}}? I'm here to help you find what works for your lifestyle.",
            "💡 Quick Check-in: How are you feeling about your {{goal_type}} progress? Any questions or concerns?"
          ]
        },
        recommended_posting_schedule: {
          optimal_times: ['06:30', '12:00', '18:30'],
          frequency: 'daily',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          avoid_times: ['late_night']
        },
        target_audience_profile: {
          age_range: '25-50',
          interests: ['fitness', 'nutrition', 'mental health', 'lifestyle improvement', 'community support'],
          behavior: 'Motivated but sometimes inconsistent, values community and expert guidance',
          communication_style: 'Appreciates encouraging, non-judgmental support with actionable advice'
        },
        brand_voice: 'enthusiastic',
        tags: ['health', 'wellness', 'fitness', 'community', 'motivation', 'lifestyle'],
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'local-business',
        name: 'Local Business Community Engagement',
        description: 'Connect with the local community through neighborhood updates, local partnerships, and personalized service to build strong local presence.',
        industry: 'Local Business',
        business_type: 'Restaurant/Shop/Service',
        business_objectives: {
          primary_goal: 'Become the go-to local business by building strong community relationships and providing exceptional local service',
          secondary_goals: ['Increase foot traffic', 'Build customer loyalty', 'Generate word-of-mouth', 'Support local events'],
          target_audience: 'Local residents and businesses within a 5-mile radius who value community connection and supporting local enterprises',
          value_proposition: 'Local expertise, community commitment, personalized service, and convenient neighborhood location',
          key_challenges: ['Competition from chains', 'Limited marketing budget', 'Seasonal fluctuations', 'Building awareness']
        },
        target_metrics: {
          response_rate_target: 40,
          engagement_rate_target: 30,
          conversion_rate_target: 15,
          monthly_message_target: 150
        },
        content_distribution: {
          educational: 30,
          promotional: 30,
          engagement: 30,
          support: 10
        },
        sample_content: {
          educational: [
            "🏘️ Local Spotlight: Did you know {{local_fact}}? Here's what makes our neighborhood special!",
            "👨‍🍳 Behind the Scenes: Learn about {{process/ingredient}} and why we choose quality over shortcuts.",
            "📍 Community Guide: {{seasonal_activity}} season is here! Here are the best local spots to enjoy it."
          ],
          promotional: [
            "🎉 Neighborhood Special: {{offer}} for our local community! Show this message for {{discount}}.",
            "📅 This Week Only: Try our new {{product/service}} - made especially for {{local_preference}}!",
            "🏆 Local Love: Thank you {{neighborhood}}! To celebrate, we're offering {{special_deal}} this weekend."
          ],
          engagement: [
            "🤔 Local Question: What's your favorite thing about living in {{neighborhood}}? Share your thoughts!",
            "📸 Community Feature: Tag us in your {{product/experience}} photos for a chance to be featured!",
            "🗳️ Help us decide: Should we add {{option_1}} or {{option_2}} to our {{menu/services}}? Vote below!"
          ],
          support: [
            "📞 Questions about {{service/product}}? As your neighborhood {{business_type}}, I'm here to help anytime!",
            "🚗 Parking Tip: Here's the easiest way to find parking when visiting us during busy times.",
            "⏰ Hours Update: We'll be {{schedule_change}} this {{day/week}} due to {{reason}}. Thanks for understanding!"
          ]
        },
        recommended_posting_schedule: {
          optimal_times: ['08:00', '11:30', '17:30'],
          frequency: '4-5 times per week',
          days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          avoid_times: ['very_early_morning', 'late_night']
        },
        target_audience_profile: {
          age_range: '25-65',
          interests: ['local community', 'supporting small business', 'convenience', 'neighborhood events'],
          behavior: 'Values personal relationships, community involvement, and convenient local options',
          communication_style: 'Appreciates friendly, personal communication with local relevance and community focus'
        },
        brand_voice: 'friendly',
        tags: ['local-business', 'community', 'neighborhood', 'small-business', 'local-marketing'],
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'saas-tech',
        name: 'SaaS Product Education & Growth',
        description: 'Drive user adoption and reduce churn through educational content, feature highlights, and proactive customer success communication.',
        industry: 'Technology/SaaS',
        business_type: 'Software Company',
        business_objectives: {
          primary_goal: 'Increase user adoption, reduce churn, and drive upgrades through educational content and proactive customer success',
          secondary_goals: ['Increase feature adoption', 'Generate user referrals', 'Collect feedback', 'Build product advocates'],
          target_audience: 'Business professionals and teams using or considering SaaS solutions to improve their workflows and productivity',
          value_proposition: 'Cutting-edge technology, continuous improvement, excellent support, and measurable ROI for business operations',
          key_challenges: ['User onboarding complexity', 'Feature discovery', 'Demonstrating ROI', 'Reducing churn']
        },
        target_metrics: {
          response_rate_target: 25,
          engagement_rate_target: 15,
          conversion_rate_target: 6,
          monthly_message_target: 250
        },
        content_distribution: {
          educational: 50,
          promotional: 20,
          engagement: 15,
          support: 15
        },
        sample_content: {
          educational: [
            "💡 Pro Tip: Use {{feature_name}} to {{benefit}} - here's a quick 2-minute setup guide that'll save you hours!",
            "📊 Data Insight: Teams using {{feature}} see {{statistic}} improvement in {{metric}}. Here's how to get started.",
            "🔧 Tutorial Tuesday: Master {{workflow}} with this step-by-step guide. Boost your productivity today!"
          ],
          promotional: [
            "🚀 New Feature Alert: {{feature_name}} is now live! Upgrade to {{plan}} to unlock {{benefit}} and more.",
            "⭐ Limited Time: Get {{discount}}% off {{plan_name}} for the first {{period}}. Perfect for {{use_case}}.",
            "📈 Success Story: See how {{company_name}} achieved {{result}} using our {{feature}}. Ready for similar results?"
          ],
          engagement: [
            "🤔 Quick Question: What's your biggest workflow challenge? We might have a feature that can help!",
            "💬 Feature Request Friday: What would make {{product_name}} even better for your team? Share your ideas!",
            "📊 Poll: Which integration would be most valuable for your workflow? {{option_1}} or {{option_2}}?"
          ],
          support: [
            "🛠️ Need help with {{feature}}? Our support team is here! Reply with your question and we'll get you sorted quickly.",
            "📚 Resource Center: Having trouble with {{task}}? Check out our updated guide: {{link}}",
            "✅ Account Health: Your {{metric}} looks great! Here are some advanced tips to optimize even further."
          ]
        },
        recommended_posting_schedule: {
          optimal_times: ['09:00', '14:00', '16:00'],
          frequency: 'daily',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          avoid_times: ['weekends', 'early_morning', 'late_evening']
        },
        target_audience_profile: {
          age_range: '28-50',
          interests: ['productivity', 'business optimization', 'technology trends', 'data analysis', 'team collaboration'],
          behavior: 'Goal-oriented professionals who value efficiency and measurable results',
          communication_style: 'Prefers concise, value-focused communication with clear benefits and actionable insights'
        },
        brand_voice: 'professional',
        tags: ['saas', 'technology', 'b2b', 'software', 'productivity', 'customer-success'],
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
}

export const strategyTemplatesService = new StrategyTemplatesService() 