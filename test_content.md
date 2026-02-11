# 🎨 Design System Guide

Welcome to the **RedNote Converter** style guide. This document demonstrates all supported markdown features.

## 1. Typography & Formatting

We support standard markdown formatting:
- **Bold text** for emphasis
- *Italic text* for subtlety
- ~~Strikethrough~~ for deprecated items
- `Inline code` for technical terms

> "Design is not just what it looks like and feels like. Design is how it works."
> — *Steve Jobs*

---

## 2. Lists & Organization

### Ordered List
1.  **Research**: Understand the user patterns
2.  **Design**: Create high-fidelity mockups
3.  **Develop**: Build with efficient code

### Unordered List
- 🎨 **Color Palette**: Vibrant and accessible
- 📐 **Typography**: Clean and readable
- ⚡️ **Performance**: Fast loading times

### Nested List
- Frontend
  - React
  - Tailwind CSS
- Backend
  - Node.js
  - Next.js

---

## 3. Code Blocks

We support syntax highlighting with a Mac-style window header.

### TypeScript / React
```tsx
interface Props {
  title: string;
  isActive: boolean;
}

const Button: React.FC<Props> = ({ title, isActive }) => {
  return (
    <button className={isActive ? 'active' : 'inactive'}>
      {title}
    </button>
  );
};
```

### CSS / Styling
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}
```

---

## 4. Visual Elements

### Tables (GFM)
| Feature | Status | Priority |
| :--- | :---: | ---: |
| Dark Mode | ✅ Ready | High |
| Export | ✅ Ready | High |
| Cloud Sync | 🚧 WIP | Low |

### Images
![Abstract Design](https://picsum.photos/seed/design/800/400)
*Figure 1: Generated placeholder image*

### Links
Visit [Next.js Documentation](https://nextjs.org) to learn more.

---

## 5. Stress Test (Oversized Content)

The following is a generated long paragraph to test the **Smart Splitting** feature. It should span multiple cards without cutting off mid-character.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
