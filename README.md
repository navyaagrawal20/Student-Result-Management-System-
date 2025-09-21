# Student Result Management System (SRMS)

A comprehensive web-based Student Result Management System built with Java backend and modern HTML/CSS/JavaScript frontend.

## 🚀 Features

### Frontend Features
- **Modern Dashboard** - Overview with statistics and analytics
- **Add Students** - Interactive form to add new student records
- **Search Students** - Find students by roll number
- **View All Students** - Sortable and filterable student table
- **Analytics** - Grade distribution and performance metrics
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Updates** - Instant feedback and data updates
- **Export Functionality** - Download student data as CSV

### Backend Features
- **RESTful API** - Clean HTTP endpoints for all operations
- **JSON Communication** - Structured data exchange
- **Database Integration** - MySQL database support (optional)
- **Memory Storage** - Fallback to in-memory storage
- **CORS Support** - Cross-origin resource sharing enabled
- **Static File Serving** - Serves frontend files directly

## 📁 Project Structure

```
Student Result Management System (SRMS)/
├── frontend/
│   ├── index.html          # Main frontend interface
│   ├── styles.css          # Modern CSS styling
│   └── script.js           # JavaScript functionality
├── Student.java            # Student model class
├── ResultCalculator.java   # Grade calculation logic
├── DatabaseHandler.java    # Database operations
├── SimpleJSON.java         # JSON parsing utility
├── WebServer.java          # HTTP server and API
├── MainApp.java           # Console-based application
└── README.md              # This documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Java Development Kit (JDK) 8 or higher
- MySQL Database (optional, for persistence)
- Web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone/Download the project**
   ```bash
   cd "Student Result Management System (SRMS)"
   ```

2. **Compile the Java files**
   ```bash
   javac -cp . *.java
   ```

3. **Start the web server**
   ```bash
   java WebServer
   ```

4. **Open your browser**
   Navigate to: `http://localhost:8080`

### Database Setup (Optional)

1. **Create MySQL database**
   ```sql
   CREATE DATABASE srms;
   USE srms;
   
   CREATE TABLE students (
       roll_no INT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       subject1 INT NOT NULL,
       subject2 INT NOT NULL,
       subject3 INT NOT NULL,
       total INT NOT NULL,
       percentage FLOAT NOT NULL
   );
   ```

2. **Update database credentials**
   Edit `DatabaseHandler.java` with your MySQL credentials:
   ```java
   private static final String URL = "jdbc:mysql://localhost:3306/srms";
   private static final String USER = "your_username";
   private static final String PASSWORD = "your_password";
   ```

## 🖥️ Usage Guide

### Web Interface

1. **Dashboard**
   - View overall statistics
   - See recent student additions
   - Monitor performance metrics

2. **Add Student**
   - Fill in student details
   - Enter marks for three subjects
   - System automatically calculates total, percentage, and grade

3. **Search Student**
   - Enter roll number to find specific student
   - View detailed student information

4. **All Students**
   - Browse complete student list
   - Filter by grade
   - Export data to CSV

5. **Analytics**
   - Grade distribution visualization
   - Performance metrics overview

### Console Interface (Alternative)

Run the traditional console application:
```bash
java MainApp
```

## 🔧 API Endpoints

### GET /api/students
Get all students
```json
Response: [
  {
    "rollNo": 1,
    "name": "John Doe",
    "subject1": 85,
    "subject2": 90,
    "subject3": 88,
    "total": 263,
    "percentage": 87.67,
    "grade": "A"
  }
]
```

### GET /api/students/{rollNo}
Get specific student by roll number
```json
Response: {
  "rollNo": 1,
  "name": "John Doe",
  "subject1": 85,
  "subject2": 90,
  "subject3": 88,
  "total": 263,
  "percentage": 87.67,
  "grade": "A"
}
```

### POST /api/students
Add new student
```json
Request: {
  "rollNo": 1,
  "name": "John Doe",
  "subject1": 85,
  "subject2": 90,
  "subject3": 88
}
```

## 📊 Grading System

| Percentage | Grade |
|------------|-------|
| 90% - 100% | A+    |
| 75% - 89%  | A     |
| 60% - 74%  | B     |
| 40% - 59%  | C     |
| 0% - 39%   | F     |

## 🎨 Frontend Technologies

- **HTML5** - Modern semantic markup
- **CSS3** - Flexbox, Grid, Gradients, Animations
- **JavaScript ES6+** - Async/await, Modules, Arrow functions
- **Font Awesome** - Icons and visual elements
- **Responsive Design** - Mobile-first approach

## ⚙️ Backend Technologies

- **Java** - Core application logic
- **HTTP Server** - Built-in `com.sun.net.httpserver`
- **JSON Processing** - Custom SimpleJSON utility
- **JDBC** - Database connectivity (optional)
- **Stream API** - Modern Java collection processing

## 🔒 Security Features

- Input validation on both frontend and backend
- SQL injection prevention with prepared statements
- CORS headers for secure cross-origin requests
- Error handling and user feedback

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance Features

- Efficient in-memory storage
- Lazy loading of data
- Optimized database queries
- Responsive design with smooth animations
- Local storage fallback

## 🛠️ Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   - Change PORT variable in `WebServer.java`
   - Or stop other applications using port 8080

2. **Database connection error**
   - Check MySQL service is running
   - Verify database credentials
   - Ensure database and table exist

3. **Frontend not loading**
   - Ensure `frontend/` directory exists
   - Check file permissions
   - Verify all frontend files are present

### Error Messages

- **"Student with this roll number already exists"** - Use a different roll number
- **"Invalid student data"** - Check that all fields are filled correctly
- **"Student not found"** - Verify the roll number exists in the system

## 📈 Future Enhancements

- User authentication and authorization
- Student photo upload
- Bulk student import/export
- Email notifications
- Advanced reporting and analytics
- Mobile app development
- Cloud deployment support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Development

### Local Development
```bash
# Compile and run
javac -cp . *.java
java WebServer

# Access frontend
http://localhost:8080

# Access API
http://localhost:8080/api/students
```

### Testing
- Test all CRUD operations through the web interface
- Verify API endpoints with tools like Postman or curl
- Check responsive design on different screen sizes

---

**Created with ❤️ for educational purposes**

*This Student Result Management System demonstrates modern web development practices with Java backend and responsive frontend design.*
