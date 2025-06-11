# SwingSocial - Brand Guidelines & Design System

## Project Overview

**SwingSocial** is a modern social networking and dating application built with Next.js, designed to connect people through social events, messaging, and matchmaking. The platform features a sophisticated swipe-based matching system, event management, marketplace functionality, and comprehensive user profiles.

### Core Features
- **User Authentication & Profiles**: Complete user management with detailed profiles and photo galleries
- **Swipe Matching System**: Tinder-style card interface for user discovery and matching
- **Event Management**: Create, discover, and attend social events with RSVP functionality
- **Real-time Messaging**: Live chat system with Socket.io integration
- **Marketplace**: Buy and sell items within the community
- **Community Features**: News feed, member directory, and social interactions
- **Mobile-First Design**: Responsive interface optimized for mobile devices

---

## Brand Identity

### Brand Philosophy
SwingSocial embodies modern romance and social connection through a sleek, sophisticated dark theme. The brand combines excitement and elegance, using bold magenta accents against rich dark backgrounds to create an atmosphere that's both inviting and premium.

### Brand Personality
- **Bold & Confident**: Strong color choices and clear typography
- **Modern & Sophisticated**: Clean lines and contemporary design patterns
- **Inclusive & Social**: Welcoming interface that encourages interaction
- **Premium & Polished**: High-quality visual presentation

---

## Color Palette

### Primary Brand Colors

#### Main Accent Colors
- **Brand Primary**: `#FF1B6B` - Vibrant magenta/pink used for primary CTAs and navigation
- **Brand Secondary**: `#c2185b` - Deep pink for hover states and secondary actions
- **Brand Deep**: `#d81160` - Rich pink for special highlights and active states

#### Dark Theme Foundation
- **Background Primary**: `#121212` - Main application background
- **Background Secondary**: `#0a0a0a` - Headers and deeper sections
- **Surface**: `#1e1e1e` - Cards, modals, and component backgrounds
- **Surface Overlay**: `rgba(0,0,0,0.2)` - Transparent overlays and papers

#### Supporting Colors
- **Success**: `#4CAF50` - Like actions and positive feedback
- **Warning**: `#FFC107` - Maybe actions and caution states
- **Error**: `#F44336` - Delete actions and error states  
- **Info**: `#03dac5` - Match notifications and information
- **Purple Accent**: `#9c27b0` - Special UI elements and checkboxes

#### Text Colors
- **Primary Text**: `#ffffff` - Main content and headings
- **Secondary Text**: `#aaaaaa` - Subtitles and less prominent text
- **Muted Text**: `rgba(255,255,255,0.7)` - Helper text and placeholders

---

## Typography

### Font Families

#### Primary Fonts
- **System Font**: Arial, Helvetica, sans-serif (main application font)
- **Brand Font**: "Lobster" (Google Font) - Used for special branding elements
- **Modern Sans**: "Poppins", "Roboto", "Arial", sans-serif - Used in registration flows

#### Next.js Optimized Fonts
- **Geist Sans**: Variable weight 100-900 (--font-geist-sans)
- **Geist Mono**: Variable weight 100-900 (--font-geist-mono)

### Typography Scale
- **H1**: 2.5rem, Bold - Page titles
- **H2**: 2rem, Bold - Section headers  
- **H3**: 1.5rem, Bold - Card titles
- **Body**: 1rem, Regular - Main content
- **Caption**: 0.85rem, Regular - Helper text
- **Small**: 0.75rem, Regular - Labels and metadata

---

## Layout & Spacing

### Border Radius System
SwingSocial uses generous rounded corners throughout the interface to create a friendly, modern aesthetic:

- **Micro**: `4px` - Small chips and tags
- **Small**: `8px` - Images and compact elements
- **Medium**: `12px` - Standard cards and components
- **Large**: `16px` - Main containers and modals
- **Extra Large**: `30px` - Navigation elements (top corners only)
- **Circular**: `50%` - Avatars and action buttons

### Spacing Scale
- **xs**: `8px` - Tight spacing
- **sm**: `16px` - Standard spacing
- **md**: `24px` - Section spacing
- **lg**: `32px` - Large gaps  
- **xl**: `64px` - Major layout divisions
- **2xl**: `80px` - Hero sections

### Grid System
- **Mobile**: Single column, full-width components
- **Tablet**: 2-column layouts for content grids
- **Desktop**: 3-column maximum for optimal readability

---

## Component Design Patterns

### Cards & Surfaces
- **Background**: Dark surface colors (`#1e1e1e`)
- **Border Radius**: 12px standard, 16px for large cards
- **Elevation**: Minimal shadows, rely on background contrast
- **Content Padding**: 16px standard, 24px for important cards

### Buttons

#### Primary Actions
- **Background**: Linear gradient from `#FF1B6B` to `#c2185b`
- **Border Radius**: 128px (pill shape) or circular for icon buttons
- **Hover**: Darker pink variants with smooth transitions
- **Typography**: Bold, white text

#### Secondary Actions  
- **Background**: Transparent with pink border
- **Border**: 2px solid `#c2185b`
- **Hover**: Semi-transparent pink background

#### Navigation Buttons
- **Background**: Transparent
- **Color**: Pink text and icons
- **Hover**: `translateY(-10px)` lift effect

### Form Fields

#### Input Styling
- **Background**: Dark with subtle texture
- **Border**: Bottom border on focus (2px solid `#c2185b`)
- **Label**: Pink when focused, white when inactive
- **Border Radius**: 10px for containers
- **Typography**: White text on dark background

#### States
- **Default**: Subtle dark background
- **Focus**: Pink accent border and label
- **Error**: Red border with error message
- **Success**: Green accent for validation

### Navigation

#### Header Navigation
- **Background**: Semi-transparent dark with backdrop blur
- **Logo**: Consistent placement and sizing
- **Links**: Pink hover states with smooth transitions

#### Bottom Navigation (Mobile)
- **Background**: `#1e1e1e` with subtle top border
- **Icons**: Custom PNG icons with pink active states
- **Hover**: Lift animation (`translateY(-10px)`)
- **Layout**: 5-icon layout with centered home button

### Image Treatment

#### User Avatars
- **Shape**: Perfect circles (50% border-radius)
- **Border**: 2-4px pink border (`#FF1B6B` or `#d81160`)
- **Size**: Consistent sizing across contexts
- **Fallback**: Default avatar image with brand colors

#### Gallery Images
- **Border Radius**: 8px for grid layouts
- **Aspect Ratio**: 1:1 for profile grids, flexible for content
- **Object Fit**: Cover to maintain aspect ratios
- **Hover**: Subtle scale or overlay effects

#### Banner Images
- **Treatment**: Full-width with gradient overlays
- **Overlay**: Linear gradients from dark to transparent
- **Text**: White text over dark gradient sections

---

## Animation & Interactions

### Transition System
- **Duration**: 0.3s for most interactions
- **Easing**: 
  - `ease-in-out` for standard transitions
  - `cubic-bezier(0.175, 0.885, 0.32, 1.275)` for spring-like effects
- **Properties**: Transform, opacity, and color changes

### Micro-interactions

#### Hover Effects
- **Cards**: Subtle scale (1.02x) or lift effects
- **Buttons**: Color shifts and scale changes
- **Navigation**: Lift animations for mobile tabs

#### Swipe Animations
- **Cards**: Complex transform combinations (translate + rotate)
- **Feedback**: Opacity changes for action indicators
- **Physics**: Spring-based animations for natural movement

#### Loading States
- **Spinners**: Custom loading animation with brand colors
- **Shimmer**: Subtle loading placeholders
- **Progress**: Linear progress bars with pink accent

---

## Iconography

### Icon Style
- **Format**: PNG icons for navigation, SVG for UI elements
- **Style**: Simple, modern, outlined style
- **Color**: Pink for active states, white/gray for inactive
- **Size**: Consistent sizing (24px standard, 32px for prominent)

### Custom Icons
- **Navigation**: Home, Members, Pineapple, Messaging, Matches
- **Actions**: Like (heart), Pass (X), Maybe (star)
- **Interface**: Camera, settings, notifications, search

---

## Brand Applications

### Logo Usage
- **Primary Logo**: `/logo.png` used consistently across headers
- **Size**: Responsive sizing maintaining aspect ratio
- **Placement**: Top-left in navigation, centered in onboarding
- **Clearspace**: Minimum padding around logo for readability

### Photography Style
- **Tone**: Warm, inviting, social situations
- **Treatment**: High contrast, rich colors
- **Overlay**: Dark gradients when text is placed over images
- **Quality**: High-resolution, crisp imagery

### Voice & Tone
- **Conversational**: Friendly, approachable language
- **Confident**: Clear, direct messaging
- **Inclusive**: Welcoming to all users
- **Fun**: Playful elements without being unprofessional

---

## Technical Implementation

### CSS Custom Properties
```css
:root {
  --color-primary: #FF1B6B;
  --color-secondary: #c2185b;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
}
```

### Material-UI Theme Configuration
The application uses Material-UI with custom theme overrides:
- **Primary Palette**: Pink/magenta variants
- **Background**: Custom dark theme
- **Shape**: 16px default border radius
- **Typography**: Custom font family stack

### Responsive Breakpoints
- **Mobile**: 0-599px
- **Tablet**: 600-959px  
- **Desktop**: 960px+

---

## Brand Guidelines Summary

SwingSocial's design system creates a cohesive, modern dating and social application that prioritizes user experience through:

1. **Consistent Dark Theme**: Rich dark backgrounds with vibrant pink accents
2. **Generous Rounded Corners**: 8-16px border radius throughout the interface
3. **Bold Typography**: Clear hierarchy with modern font choices
4. **Smooth Animations**: 0.3s transitions and micro-interactions
5. **Mobile-First Approach**: Responsive design optimized for mobile usage
6. **High Contrast**: Excellent readability with white text on dark surfaces
7. **Brand Recognition**: Consistent pink accent color and logo placement

This design system ensures SwingSocial maintains a premium, modern aesthetic while providing excellent usability across all devices and user interactions.


// test account: nopowo3984@adrewire.com