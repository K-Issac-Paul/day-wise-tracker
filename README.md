# ProTrack - Professional Expense & Time Tracker

A comprehensive, modern web application designed specifically for working professionals to track daily expenses and time allocation with beautiful visualizations and insights.

## 🌟 Features

### 💰 Expense Tracking
- **Day-Wise Tracking**: Add, edit, and delete expenses for any date
- **Categories**: Food, Travel, Rent, Bills, Shopping, Entertainment, Medical, Other
- **Payment Modes**: Cash, UPI, Card, Bank Transfer
- **Filtering**: Filter by date, category, and payment mode
- **Notes**: Add optional notes to each expense

### ⏰ Time Tracking
- **Activity Types**: Office Work, Commute, Meetings, Breaks, Personal Time, Sleep, Learning/Upskilling, Other
- **24-Hour Validation**: Prevents time entries exceeding 24 hours per day
- **Visual Progress**: See how much of your day is tracked
- **Detailed Breakdown**: View time allocation by activity

### 📊 Monthly Overview
- **Automatic Grouping**: Expenses and time entries grouped by month
- **Category Breakdown**: Visual charts showing spending by category
- **Daily Trends**: Line chart showing daily expense patterns
- **Time Allocation**: Pie chart of monthly time distribution
- **Statistics**: Total spending, daily averages, work vs personal time ratio

### 📈 Analytics & Insights
- **Top Categories**: See where you spend the most
- **Payment Distribution**: Analyze payment mode usage
- **Productivity Score**: Based on work hours vs total tracked time
- **Weekly Comparison**: Last 7 days expense comparison
- **Productivity Insights**: Average work hours and efficiency metrics

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with gradients and animations
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Micro-interactions for better user experience
- **Color-Coded**: Categories and activities have distinct colors

### 💾 Data Management
- **Local Storage**: All data saved in browser's local storage
- **Export to CSV**: Export expenses and time entries to CSV files
- **Edit & Delete**: Full CRUD operations on all entries
- **Data Persistence**: Your data stays even after closing the browser

## 🚀 Getting Started

### Installation

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. No installation or server required!

### Usage

#### Adding an Expense
1. Click "Add Expense" button
2. Fill in the date, category, amount, payment mode
3. Optionally add notes
4. Click "Save Expense"

#### Adding Time Activity
1. Click "Add Activity" button
2. Select date and activity type
3. Enter hours and minutes
4. Optionally add notes
5. Click "Save Activity"

#### Viewing Monthly Data
1. Navigate to "Monthly View"
2. Use arrow buttons to switch between months
3. View charts and statistics

#### Exporting Data
1. Go to Expenses or Time Tracker view
2. Click "Export" button
3. CSV file will be downloaded

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (below 768px)

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Secondary**: Pink gradient (#f093fb to #f5576c)
- **Accent**: Blue gradient (#4facfe to #00f2fe)
- **Success**: Green gradient (#43e97b to #38f9d7)

### Typography
- **Primary Font**: Inter (body text)
- **Display Font**: Outfit (headings)

### Components
- Cards with subtle shadows and hover effects
- Gradient buttons with smooth transitions
- Modern form inputs with focus states
- Animated modals with backdrop blur
- Responsive data tables

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, gradients, animations
- **JavaScript (ES6+)**: Vanilla JS with classes and modules
- **Chart.js**: Data visualization library
- **Local Storage API**: Client-side data persistence

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Structure
```
day-wise tracker/
├── index.html          # Main HTML file
├── index.css           # Styles and design system
├── app.js              # Application logic
└── README.md           # Documentation
```

## 📊 Data Structure

### Expense Object
```javascript
{
  id: "unique_timestamp",
  date: "YYYY-MM-DD",
  category: "Food|Travel|Rent|Bills|Shopping|Entertainment|Medical|Other",
  amount: 1234.56,
  paymentMode: "Cash|UPI|Card|Bank Transfer",
  notes: "Optional notes"
}
```

### Time Entry Object
```javascript
{
  id: "unique_timestamp",
  date: "YYYY-MM-DD",
  activity: "Office Work|Commute|Meetings|Breaks|Personal Time|Sleep|Learning|Other",
  hours: 8,
  minutes: 30,
  notes: "Optional notes"
}
```

## 🎯 Key Features for Working Professionals

1. **Quick Dashboard**: See today's expenses and time breakdown at a glance
2. **Productivity Tracking**: Monitor work hours vs personal time
3. **Budget Awareness**: Track daily and monthly spending patterns
4. **Time Management**: Understand how you spend your 24 hours
5. **Data Export**: Export data for further analysis or record-keeping
6. **Privacy**: All data stored locally, no server uploads

## 🔒 Privacy & Security

- All data is stored locally in your browser
- No data is sent to any server
- No tracking or analytics
- Clear your browser data to remove all information

## 🎨 Customization

You can customize the application by modifying:
- **Colors**: Edit CSS variables in `index.css`
- **Categories**: Add/modify categories in the HTML select options
- **Activities**: Add/modify activity types in the HTML select options
- **Charts**: Customize Chart.js options in `app.js`

## 📝 Tips for Best Use

1. **Daily Habit**: Add expenses and time entries daily for accurate tracking
2. **Detailed Notes**: Use notes field for better context
3. **Regular Review**: Check monthly view to understand patterns
4. **Export Regularly**: Backup your data by exporting to CSV
5. **Set Goals**: Use analytics to set spending and productivity goals

## 🐛 Troubleshooting

**Data not saving?**
- Check if browser allows local storage
- Ensure you're not in incognito/private mode

**Charts not showing?**
- Ensure Chart.js CDN is accessible
- Check browser console for errors

**Export not working?**
- Check browser's download settings
- Ensure pop-ups are not blocked

## 🚀 Future Enhancements (Ideas)

- Budget setting and alerts
- Recurring expenses
- Multi-currency support
- Cloud sync option
- Mobile app version
- Expense categories customization
- Goals and targets
- Comparison with previous months

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and enhance this application for your needs!

## 📧 Support

For issues or questions, please refer to the code comments or create an issue in the repository.

---

**Made with ❤️ for working professionals who want to track their expenses and time efficiently.**
