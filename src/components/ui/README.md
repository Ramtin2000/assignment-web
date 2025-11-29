# UI Components

Reusable UI components built with styled-components and framer-motion.

## Button

A versatile button component with multiple variants and sizes.

```jsx
import { Button } from './components/ui';

// Basic usage
<Button variant="primary">Click me</Button>

// With icon
<Button variant="primary" icon={<Icon />} iconPosition="left">
  Click me
</Button>

// Variants: primary, secondary, outline, ghost, danger, success
// Sizes: sm, md, lg
// Props: fullWidth, disabled, onClick, type
```

## Dashboard Components

### DashboardContainer
Main container for dashboard pages with background and padding.

### DashboardContent
Content wrapper with max-width and centering.

### DashboardHeader
Header section with title and subtitle.

```jsx
<DashboardHeader>
  <DashboardTitle>My Dashboard</DashboardTitle>
  <DashboardSubtitle>View your data here</DashboardSubtitle>
</DashboardHeader>
```

### DashboardGrid
Responsive grid layout for cards.

```jsx
<DashboardGrid columns={3}>
  <DashboardCard>Card 1</DashboardCard>
  <DashboardCard>Card 2</DashboardCard>
</DashboardGrid>
```

### DashboardCard
Card component with hover effects.

```jsx
<DashboardCard clickable onClick={handleClick}>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardBody>Card content</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</DashboardCard>
```

## Badge

Badge component for labels and scores.

```jsx
import { Badge, ScoreBadge } from './components/ui';

// Basic badge
<Badge variant="success">Success</Badge>

// Score badge (auto-colors based on score)
<ScoreBadge score={8.5}>8.5/10</ScoreBadge>

// Variants: success, warning, danger, info, primary, secondary, outline
// Sizes: sm, md, lg
```

## Loading

Loading state component.

```jsx
import { Loading } from './components/ui';

<Loading message="Loading data..." />
```

## Error

Error state component with retry/back options.

```jsx
import { Error } from './components/ui';

<Error 
  title="Error"
  message="Something went wrong"
  onRetry={handleRetry}
  onBack={handleBack}
/>
```

## BackButton

Animated back button with icon.

```jsx
import { BackButton } from './components/ui';

<BackButton onClick={handleBack}>Back to Dashboard</BackButton>
```

## Animation Variants

Pre-built animation variants for consistent animations:

```jsx
import { containerVariants, itemVariants } from './components/ui';

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>
```

