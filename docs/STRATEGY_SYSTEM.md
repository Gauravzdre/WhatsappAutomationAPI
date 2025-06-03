# Strategy System Documentation

## Overview

The Strategy System is a comprehensive content management and optimization framework for Schedsy.ai that helps users create, manage, and optimize their messaging strategies using AI-powered insights and content pillar frameworks.

## Phase 1 Implementation

### Core Components

#### 1. Database Schema (`supabase/migrations/005_strategy_system.sql`)

**Tables Created:**
- `strategies` - Core strategy management
- `audience_segments` - Basic audience segmentation  
- `content_pillar_analytics` - Performance tracking for content pillars
- `strategy_analytics` - General analytics tracking

**Enhanced Tables:**
- `templates` - Added `content_pillar`, `strategy_id`, and `performance_score` columns

**Key Features:**
- Row Level Security (RLS) policies
- Automatic analytics updates via database triggers
- Performance indexes for efficient queries

#### 2. Content Pillar Framework

The system uses four core content pillars with default distribution:

- **Educational (40%)** - Tips, tutorials, industry insights
- **Promotional (30%)** - Sales, offers, product highlights
- **Engagement (20%)** - Questions, polls, community building
- **Support (10%)** - Help, troubleshooting, customer service

#### 3. TypeScript Types (`src/types/strategy.ts`)

Comprehensive type definitions including:
- Core strategy interfaces
- Content pillar and analytics types
- Dashboard and wizard interfaces
- Hook return types

#### 4. Strategy Service (`src/lib/strategy-service.ts`)

**Key Methods:**
- `createStrategy()` - Create new strategies
- `createStrategyFromWizard()` - Wizard-based strategy creation
- `getStrategyDashboard()` - Dashboard data aggregation
- `getContentPillarInsights()` - Content analysis and recommendations
- `autoCategorizeTemplates()` - AI-powered template categorization

#### 5. React Hooks (`src/hooks/useStrategy.ts`)

**Available Hooks:**
- `useStrategy()` - Main strategy management
- `useStrategyDashboard()` - Dashboard data
- `useContentPillarAnalytics()` - Content pillar insights
- `useStrategyDetails()` - Individual strategy details
- `useTemplateCategorizaton()` - Template categorization

### User Interface

#### 1. Strategy Dashboard (`src/app/strategy/page.tsx`)

**Features:**
- Overview cards showing key metrics
- Content pillar health visualization
- Quick actions for improvements
- Strategy list with status indicators

**Key Metrics:**
- Active strategies count
- Template coverage percentage
- Content balance health score
- Overall performance score

#### 2. Strategy Creation Wizard (`src/app/strategy/create/page.tsx`)

**4-Step Process:**
1. **Business Foundation** - Business name, industry, goals
2. **Target Audience** - Audience description, communication preferences
3. **Content Strategy** - Brand voice, content distribution
4. **Success Metrics** - Response rate, engagement, conversion targets

#### 3. Strategy Details Page (`src/app/strategy/[id]/page.tsx`)

**Tabs:**
- **Overview** - Business objectives and target metrics
- **Content Pillars** - Distribution analysis and recommendations
- **Audience** - Audience segments and preferences
- **Performance** - Analytics and insights

### Integration Features

#### 1. Smart Scheduling Integration (`src/lib/smart-scheduling.ts`)

Enhanced to support:
- Strategy context in scheduling optimization
- Content pillar-aware timing recommendations
- Audience segment preferences

#### 2. Template Strategy Integration (`src/lib/template-strategy-integration.ts`)

**Features:**
- Template categorization with strategy context
- Content distribution health calculation
- Optimal timing recommendations per content pillar
- Bulk template categorization

## Usage Guide

### Creating a Strategy

1. Navigate to `/strategy`
2. Click "New Strategy"
3. Complete the 4-step wizard:
   - Define business foundation
   - Describe target audience
   - Set content distribution preferences
   - Configure success metrics

### Managing Templates

1. **Auto-Categorization**: Use the "Auto-Categorize" button on strategy details page
2. **Manual Categorization**: Update templates individually
3. **Strategy Assignment**: Link templates to specific strategies

### Monitoring Performance

1. **Dashboard View**: Overview of all strategies and health metrics
2. **Strategy Details**: Deep dive into individual strategy performance
3. **Content Pillar Analysis**: Track distribution vs targets

### Content Optimization

1. **Distribution Health**: Monitor content balance across pillars
2. **Performance Insights**: Identify top and underperforming pillars
3. **Scheduling Optimization**: Leverage content pillar timing recommendations

## Database Migration

To apply the strategy system schema:

```sql
-- Run the migration file
\i supabase/migrations/005_strategy_system.sql
```

## API Integration

### Strategy Service Usage

```typescript
import { strategyService } from '@/lib/strategy-service'

// Create a strategy
const strategy = await strategyService.createStrategy({
  name: 'Q1 Growth Strategy',
  description: 'Focus on customer acquisition',
  status: 'active'
})

// Get dashboard data
const dashboard = await strategyService.getStrategyDashboard()

// Auto-categorize templates
const result = await strategyService.autoCategorizeTemplates(strategyId)
```

### Hook Usage

```typescript
import { useStrategy, useStrategyDashboard } from '@/hooks/useStrategy'

function StrategyComponent() {
  const { strategies, createStrategy, loading } = useStrategy()
  const { dashboard } = useStrategyDashboard()
  
  // Component logic
}
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- RLS policies for security
- Automatic analytics updates via triggers

### Frontend Optimization
- Lazy loading of strategy details
- Cached dashboard data
- Optimistic updates for better UX

## Future Enhancements (Phase 2+)

### AI-Powered Features
- Advanced content categorization using AI
- Predictive analytics for strategy optimization
- Automated A/B testing recommendations

### Advanced Analytics
- Real-time performance tracking
- Competitor analysis integration
- ROI calculation and reporting

### Automation Sequences
- Multi-step messaging campaigns
- Trigger-based content delivery
- Advanced scheduling optimization

### Team Collaboration
- Multi-user strategy management
- Role-based permissions
- Collaborative editing features

## Troubleshooting

### Common Issues

1. **Templates not categorizing**: Check if strategy exists and user has permissions
2. **Dashboard not loading**: Verify database connection and RLS policies
3. **Performance slow**: Check if indexes are properly created

### Error Handling

The system includes comprehensive error handling:
- Graceful degradation when services are unavailable
- User-friendly error messages
- Fallback data for critical components

## Security

### Row Level Security (RLS)
- All strategy data is user-scoped
- Audience segments inherit strategy permissions
- Analytics data is protected by strategy ownership

### API Security
- All endpoints require authentication
- User context validated on every request
- Input sanitization and validation

## Testing

### Component Testing
```bash
npm run test -- strategy
```

### Integration Testing
```bash
npm run test:integration -- strategy
```

### Database Testing
```bash
npx supabase test db
```

## Support

For issues or questions about the strategy system:

1. Check this documentation
2. Review error logs in the browser console
3. Verify database migration status
4. Contact the development team

---

*Last updated: January 2025* 