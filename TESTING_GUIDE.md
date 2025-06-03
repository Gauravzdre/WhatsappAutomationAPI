# Schedsy.ai End-to-End Testing Guide

## Overview
This guide provides step-by-step instructions for testing all features of the Schedsy.ai WhatsApp AI Automation Platform. Focus on user experience, functionality, and visual consistency across all pages.

## Getting Started

### Initial Setup
1. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:3000`
   - Verify the application loads without errors

2. **Authentication Check**
   - If prompted to login, use test credentials
   - Verify successful login redirects to the main dashboard

---

## 1. Dashboard Testing

### Main Dashboard
- **Visual Check**: Verify the dashboard has a clean, modern design with proper navigation
- **Navigation Bar**: Test all navigation links (Dashboard, Strategy, Templates, etc.)
- **Responsive Design**: Test on different screen sizes (desktop, tablet, mobile)
- **Loading States**: Check that all cards and data load properly

---

## 2. Strategy System Testing

### Strategy Dashboard (`/strategy`)

#### Visual Elements
- **Dark Theme Cards**: Verify all cards have dark backgrounds with proper contrast
- **Overview Cards**: Check that metrics display correctly (Total Strategies, Active Templates, etc.)
- **Content Pillar Health**: Verify the health indicators show appropriate status
- **Quick Actions**: Test all action buttons work properly

#### Functionality Tests
1. **Browse Templates Button**: Click and verify it navigates to strategy templates
2. **Create Strategy Button**: Test navigation to strategy creation
3. **Strategy List**: Verify existing strategies display with correct information
4. **Filter/Search**: Test any filtering or search functionality

### Strategy Templates (`/strategy/templates`)

#### Template Browsing
1. **Template Grid**: Verify all 5 strategy templates display correctly
2. **Industry Filtering**: Test the industry filter dropdown
3. **Search Functionality**: Search for templates by name, description, or tags
4. **Template Cards**: Check each template shows:
   - Industry and business type
   - Content distribution percentages
   - Target metrics
   - Brand voice indicator
   - Tags

#### Template Interaction
1. **Template Preview**: Click "View Details" on each template
2. **Modal Functionality**: Verify preview modal opens and displays:
   - Business objectives
   - Sample content for each pillar
   - Complete template information
3. **Use Template**: Test "Use This Template" button
4. **Modal Close**: Verify modal closes properly

### Strategy Creation (`/strategy/create`)

#### Wizard Navigation
1. **Step 1 - Basic Information**:
   - Fill in strategy name and description
   - Select business type and industry
   - Test "Next" button functionality

2. **Step 2 - Business Objectives**:
   - Enter primary goal, target audience, value proposition
   - Test form validation
   - Navigate back and forward between steps

3. **Step 3 - Content Distribution**:
   - Adjust content pillar percentages
   - Verify total equals 100%
   - Test validation for incorrect totals

4. **Step 4 - Target Metrics**:
   - Set response rate, engagement rate, conversion targets
   - Test number input validation
   - Complete strategy creation

#### Completion Testing
- Verify successful strategy creation
- Check redirect to strategy details page
- Confirm new strategy appears in strategy list

### Strategy Details (`/strategy/[id]`)

#### Page Layout
- **Dark Theme**: Verify all cards use dark theme consistently
- **Header Section**: Check strategy name, status badge, creation date
- **Action Buttons**: Test Refresh, Auto-Categorize, Edit Strategy buttons

#### Tab Navigation
1. **Overview Tab**:
   - Business Objectives card content
   - Target Metrics display
   - Proper text contrast and readability

2. **Content Pillars Tab**:
   - Content distribution visualization
   - Individual pillar status indicators
   - Health recommendations

3. **Audience Tab**:
   - Audience segments display
   - Segment details and preferences
   - Empty state if no segments

4. **Performance Tab**:
   - Analytics data display
   - Performance metrics
   - Empty state handling

### Strategy Editing (`/strategy/[id]/edit`)

#### Form Testing
1. **Dark Theme Cards**: Verify all form cards use dark theme
2. **Basic Information Card**:
   - Edit strategy name and description
   - Change status dropdown
   - Test form validation

3. **Business Objectives Card**:
   - Modify primary goal, target audience, value proposition
   - Test required field validation

4. **Content Distribution Card**:
   - Adjust pillar percentages
   - Verify total calculation updates
   - Test validation for incorrect totals

5. **Target Metrics Card**:
   - Modify all metric targets
   - Test number input validation
   - Verify range constraints

#### Save Functionality
- Test "Save Changes" button
- Verify loading state during save
- Check redirect to strategy details after save
- Confirm changes are reflected in the strategy

---

## 3. Template Library Testing (`/templates`)

### Template Grid View

#### Visual Elements
- **Template Cards**: Verify all 20 templates display correctly
- **Category Icons**: Check each template has appropriate category icon
- **Status Badges**: Verify Active/Inactive status display
- **Usage Statistics**: Check usage count and success rate display

#### Template Categories
Test filtering by each category:
1. **All Templates** (20 total)
2. **Welcome Messages** (2 templates)
3. **Customer Support** (4 templates)
4. **Sales & Conversion** (1 template)
5. **Marketing Campaigns** (8 templates)
6. **Follow-up Messages** (5 templates)
7. **Custom Templates** (0 initially)

#### Search and Filter
1. **Search Bar**: Test searching by:
   - Template name
   - Description keywords
   - Tags
2. **Category Filter**: Test dropdown filter functionality
3. **Category Pills**: Test clicking category pills for quick filtering
4. **Results Count**: Verify badge counts update correctly

### Template Interaction

#### Template Cards
For each template, test:
1. **Template Preview**: Verify content preview displays correctly
2. **Variable Display**: Check that variables ({{customerName}}, etc.) show properly
3. **Tags**: Verify tags display and truncate appropriately
4. **Metrics**: Check last used time and success rate

#### Template Actions
Test all action buttons on template cards:
1. **Edit Button**: Opens template editor
2. **Copy Button**: Creates duplicate template
3. **Toggle Active/Inactive**: Changes template status
4. **Delete Button**: Removes template (with confirmation)

### Template Editor

#### Creating New Templates
1. **Create Template Button**: Opens editor in create mode
2. **Form Fields**:
   - Template name (required)
   - Category selection
   - Description (required)
   - Content with variable support (required)
   - Tags (comma-separated)
   - Active checkbox

3. **Validation Testing**:
   - Test required field validation
   - Test variable extraction from content
   - Verify error messages display correctly

4. **Save Functionality**:
   - Test successful template creation
   - Verify return to template grid
   - Check new template appears in list

#### Editing Existing Templates
1. **Edit Mode**: Click edit on existing template
2. **Pre-filled Data**: Verify all fields populate correctly
3. **Modification**: Change various fields
4. **Update**: Save changes and verify updates

---

## 4. Cross-Page Navigation Testing

### Navigation Consistency
1. **Top Navigation**: Test navigation between all main sections
2. **Breadcrumbs**: Verify breadcrumb navigation where applicable
3. **Back Buttons**: Test all "Back" buttons function correctly
4. **Deep Linking**: Test direct URL access to specific pages

### URL Testing
Test these specific URLs work correctly:
- `/strategy`
- `/strategy/templates`
- `/strategy/create`
- `/strategy/[specific-id]`
- `/strategy/[specific-id]/edit`
- `/templates`

---

## 5. Responsive Design Testing

### Screen Sizes
Test the application on:
1. **Desktop** (1920x1080 and larger)
2. **Laptop** (1366x768)
3. **Tablet** (768x1024)
4. **Mobile** (375x667)

### Responsive Elements
- **Navigation**: Verify mobile menu functionality
- **Cards**: Check card layouts adapt properly
- **Forms**: Test form layouts on smaller screens
- **Tables/Grids**: Verify responsive grid behavior
- **Buttons**: Check button sizing and spacing

---

## 6. Dark Theme Consistency

### Visual Verification
Check all pages maintain consistent dark theme:
1. **Strategy Dashboard**: All cards use dark backgrounds
2. **Strategy Details**: All tabs and cards are dark themed
3. **Strategy Edit**: All form cards use dark theme
4. **Templates**: Verify theme consistency
5. **Text Contrast**: Ensure all text is readable

### Theme Elements
- **Card Backgrounds**: Dark gray backgrounds with proper borders
- **Text Colors**: White/light gray text on dark backgrounds
- **Buttons**: Consistent styling across pages
- **Form Elements**: Proper contrast and visibility

---

## 7. Error Handling Testing

### Form Validation
1. **Required Fields**: Test submitting forms with empty required fields
2. **Invalid Data**: Test invalid email formats, negative numbers, etc.
3. **Boundary Values**: Test minimum/maximum values where applicable

### Network Scenarios
1. **Slow Loading**: Test behavior with slow network
2. **Error States**: Verify error messages display appropriately
3. **Loading States**: Check loading indicators work correctly

---

## 8. Data Persistence Testing

### Strategy Data
1. **Create Strategy**: Verify data persists after creation
2. **Edit Strategy**: Confirm changes save correctly
3. **Navigation**: Check data remains after page navigation

### Template Data
1. **Template Creation**: Verify new templates persist
2. **Template Editing**: Confirm modifications save
3. **Template Status**: Check active/inactive state persists

---

## 9. Performance Testing

### Page Load Times
- **Initial Load**: Time from URL entry to page display
- **Navigation**: Speed of transitions between pages
- **Form Submission**: Response time for form saves

### User Experience
- **Smooth Animations**: Verify transitions are smooth
- **No Flickering**: Check for visual glitches
- **Consistent Performance**: Test multiple operations

---

## 10. Browser Compatibility

### Supported Browsers
Test on:
1. **Chrome** (latest version)
2. **Firefox** (latest version)
3. **Safari** (latest version)
4. **Edge** (latest version)

### Browser-Specific Testing
- **Feature Functionality**: All features work in each browser
- **Visual Consistency**: UI appears correctly across browsers
- **Performance**: Similar performance across browsers

---

## Testing Checklist

### Strategy System
- [ ] Strategy dashboard loads with dark theme
- [ ] Strategy templates page displays all 5 templates
- [ ] Template filtering and search work
- [ ] Strategy creation wizard completes successfully
- [ ] Strategy details page shows all tabs correctly
- [ ] Strategy editing saves changes properly
- [ ] Navigation between strategy pages works

### Template Library
- [ ] All 20 templates display correctly
- [ ] Category filtering works (6 categories + All)
- [ ] Search functionality works
- [ ] Template actions (edit, copy, delete, toggle) work
- [ ] Template editor creates and edits templates
- [ ] Template validation works correctly

### General
- [ ] Dark theme consistent across all pages
- [ ] Responsive design works on all screen sizes
- [ ] Navigation between sections works
- [ ] Error handling displays appropriate messages
- [ ] Loading states show during operations
- [ ] Data persists correctly
- [ ] Performance is acceptable

---

## Reporting Issues

When reporting issues, include:
1. **Page/Section**: Where the issue occurred
2. **Steps to Reproduce**: Exact steps taken
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happened
5. **Browser/Device**: Browser and device information
6. **Screenshots**: Visual evidence if applicable

---

## Success Criteria

The application passes testing when:
- All features function as described
- Dark theme is consistent across all strategy pages
- Responsive design works on all screen sizes
- Navigation flows smoothly between pages
- Data persists correctly
- Error handling works appropriately
- Performance is acceptable for user experience 