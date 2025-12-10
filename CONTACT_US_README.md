# Contact Us Section Feature

## 📋 Overview

This feature adds a fully customizable "Contact Us" section to the Tivr0 website with complete admin panel integration. The section is dynamically configurable through the admin interface and supports real-time updates.

## 🚀 Features

### ✅ Frontend Component
- **Dynamic Content**: All texts, labels, and placeholders configurable from admin panel
- **Responsive Design**: Works perfectly on all screen sizes
- **Form Validation**: Client-side and server-side validation
- **Social Links Integration**: Dynamic social media links with customizable icons
- **Multi-language Support**: Full Arabic/English support
- **Fallback System**: Shows default content if no settings are configured

### ✅ Admin Panel
- **Complete Control**: Edit all aspects of the contact section
- **Live Preview**: See changes in real-time before saving
- **Form Builder**: Add/remove/edit form fields dynamically
- **Social Links Manager**: Configure social media links and icons
- **Content Editor**: HTML content with sanitization
- **Validation**: Input validation and error handling
- **Reset Functionality**: Restore default settings with one click

### ✅ Technical Features
- **Type Safety**: Full TypeScript support
- **Security**: XSS protection with HTML sanitization
- **Data Persistence**: Settings saved to Supabase database
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized rendering and data fetching

## 📁 Files Created/Modified

### New Files
```
components/ContactUsSection.tsx      # Frontend contact section component
components/ContactUsManager.tsx     # Admin panel management interface
api/contact.ts                      # API endpoint for form submissions
```

### Modified Files
```
types.ts                            # Added ContactUsSettings and related interfaces
defaultSettings.ts                 # Added default contact section settings
pages/Admin.tsx                     # Added contact tab to admin panel
pages/Home.tsx                      # Added ContactUsSection to homepage
```

## 🔧 Configuration

### Default Settings
The contact section comes with pre-configured defaults:

```typescript
{
  title: { ar: 'تواصل معنا', en: 'Contact Us' },
  subtitle: { ar: 'جاهز لنقل مشروعك للمستوى التالي؟', en: 'Ready to take your business to the next level?' },
  cards: [
    {
      heading: { ar: 'حجز استشارة', en: 'Book Consultation' },
      iconType: 'svg',
      iconSVG: '<svg>...</svg>',
      contentHTML: '<div>...</div>'
    }
  ],
  socialLinks: [
    { name: 'Twitter', url: 'https://twitter.com/tivro', iconSVG_or_name: 'Twitter' },
    // ... more social links
  ],
  form: {
    fields: [
      {
        name: 'name',
        label: { ar: 'الاسم', en: 'Name' },
        placeholder: { ar: 'الاسم', en: 'Name' },
        type: 'text',
        required: true
      },
      // ... more fields
    ],
    submitText: { ar: 'إرسال الطلب', en: 'Send Request' },
    submitAction: '/api/contact'
  }
}
```

## 🎯 Usage

### For Users
1. Visit the website homepage
2. Scroll to the "Contact Us" section
3. Fill out the form fields
4. Click submit to send your message

### For Administrators
1. Log in to the admin panel
2. Navigate to "تواصل معنا" / "Contact Us" tab
3. Modify any aspect of the section:
   - Edit titles and descriptions
   - Configure form fields
   - Manage social links
   - Customize styling
4. Use preview to see changes
5. Click save to apply changes

## 🔒 Security Features

### Input Validation
- **Client-side**: Real-time validation in the form
- **Server-side**: API endpoint validation and sanitization
- **Database**: Type constraints and length limits

### XSS Protection
- **HTML Sanitization**: Only safe HTML tags allowed in content
- **Input Escaping**: All user inputs properly escaped
- **Content Security**: Restricted HTML elements in content fields

### Data Protection
- **Input Limits**: Maximum lengths for all text fields
- **URL Validation**: Social link URLs validated before saving
- **Required Fields**: Essential fields marked as required

## 🎨 Customization Options

### Form Fields
- **Types**: text, tel, email, textarea
- **Validation**: Required/optional fields
- **Labels**: Multi-language support
- **Placeholders**: Custom placeholder text

### Social Links
- **Platforms**: Any social media platform
- **Icons**: Lucide icons or custom SVG
- **URLs**: Validated external links
- **Order**: Reorderable through admin interface

### Content
- **HTML**: Limited safe HTML allowed
- **Styling**: CSS classes customization
- **Icons**: SVG or icon library support
- **Layout**: Responsive grid layout

## 🔄 Data Flow

```
Admin Panel → Settings API → Supabase Database
     ↓
Frontend Component ← Settings API ← Supabase Database
     ↓
Form Submission → Contact API → Supabase Database
```

## 🚀 Deployment

### Prerequisites
- Supabase database configured
- Required tables created
- API routes enabled

### Database Tables
```sql
-- Contact messages table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (should exist)
ALTER TABLE settings 
ADD COLUMN contact_us JSONB;
```

## 🧪 Testing

### Local Development
```bash
# Start development server
npm run dev

# Test admin panel
http://localhost:3000/#admin

# Test contact form
http://localhost:3000/#contact
```

### Form Submission Test
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+1234567890"}'
```

## 🐛 Troubleshooting

### Common Issues

#### Form Not Submitting
- Check API endpoint is accessible
- Verify Supabase connection
- Check browser console for errors

#### Settings Not Saving
- Verify admin permissions
- Check network connection
- Review browser console for API errors

#### Styling Issues
- Verify Tailwind CSS classes
- Check responsive breakpoints
- Review CSS custom classes

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'tivro:*');
```

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection and table structure
3. Review API endpoint logs
4. Test with default settings

## 🔄 Updates

This feature is designed to be:
- **Backward Compatible**: Won't break existing functionality
- **Extensible**: Easy to add new features
- **Maintainable**: Clear code structure and documentation
- **Secure**: Built with security best practices

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-30  
**Compatibility**: Tivr0 v2.0+
