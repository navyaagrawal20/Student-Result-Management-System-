import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.util.*;
import java.util.concurrent.Executors;

public class WebServer {
    private static final int PORT = 8080;
    private static List<Student> students = new ArrayList<>();
    
    public static void main(String[] args) throws IOException {
        // Create HTTP server
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // Add CORS headers to all responses
        server.createContext("/api/students", new StudentsHandler());
        server.createContext("/", new StaticFileHandler());
        
        // Set executor
        server.setExecutor(Executors.newFixedThreadPool(10));
        
        // Start server
        server.start();
        System.out.println("🚀 SRMS Web Server started on http://localhost:" + PORT);
        System.out.println("📊 Frontend available at: http://localhost:" + PORT);
        System.out.println("🔗 API endpoint: http://localhost:" + PORT + "/api/students");
        System.out.println("Press Ctrl+C to stop the server");
    }
    
    // Handler for student API endpoints
    static class StudentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Add CORS headers
            addCorsHeaders(exchange);
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                switch (method) {
                    case "GET":
                        if (path.equals("/api/students")) {
                            handleGetAllStudents(exchange);
                        } else if (path.startsWith("/api/students/")) {
                            String rollNoStr = path.substring("/api/students/".length());
                            try {
                                int rollNo = Integer.parseInt(rollNoStr);
                                handleGetStudent(exchange, rollNo);
                            } catch (NumberFormatException e) {
                                sendResponse(exchange, 400, "{\"error\":\"Invalid roll number\"}");
                            }
                        }
                        break;
                        
                    case "POST":
                        if (path.equals("/api/students")) {
                            handleAddStudent(exchange);
                        }
                        break;
                        
                    case "OPTIONS":
                        // Handle preflight requests
                        sendResponse(exchange, 200, "");
                        break;
                        
                    default:
                        sendResponse(exchange, 405, SimpleJSON.createErrorJson("Method not allowed"));
                }
            } catch (IOException | ClassCastException e) {
                System.err.println("Request handling error: " + e.getMessage());
                sendResponse(exchange, 500, SimpleJSON.createErrorJson("Internal server error"));
            }
        }
        
        private void handleGetAllStudents(HttpExchange exchange) throws IOException {
            String response = SimpleJSON.toJsonArray(students);
            sendResponse(exchange, 200, response);
        }
        
        private void handleGetStudent(HttpExchange exchange, int rollNo) throws IOException {
            Student student = students.stream()
                .filter(s -> s.getRollNo() == rollNo)
                .findFirst()
                .orElse(null);
                
            if (student != null) {
                String response = SimpleJSON.toJson(student);
                sendResponse(exchange, 200, response);
            } else {
                sendResponse(exchange, 404, SimpleJSON.createErrorJson("Student not found"));
            }
        }
        
        private void handleAddStudent(HttpExchange exchange) throws IOException {
            // Read request body
            String requestBody = readRequestBody(exchange);
            
            try {
                // Parse JSON to Map
                Map<String, Object> studentData = SimpleJSON.parseStudentJson(requestBody);
                
                // Extract data
                int rollNo = (Integer) studentData.get("rollNo");
                String name = (String) studentData.get("name");
                int subject1 = (Integer) studentData.get("subject1");
                int subject2 = (Integer) studentData.get("subject2");
                int subject3 = (Integer) studentData.get("subject3");
                
                // Check if student already exists
                boolean exists = students.stream()
                    .anyMatch(s -> s.getRollNo() == rollNo);
                    
                if (exists) {
                    sendResponse(exchange, 409, SimpleJSON.createErrorJson("Student with this roll number already exists"));
                    return;
                }
                
                // Create student object
                Student student = new Student(rollNo, name, subject1, subject2, subject3);
                
                // Calculate result
                ResultCalculator.calculateResult(student);
                
                // Add to list
                students.add(student);
                
                // Try to save to database (optional)
                try {
                    DatabaseHandler.insertStudent(student);
                    System.out.println("✅ Student saved to database: " + name);
                } catch (Exception e) {
                    System.out.println("⚠️ Database not available, student saved to memory: " + name);
                }
                
                // Return created student
                String response = SimpleJSON.toJson(student);
                sendResponse(exchange, 201, response);
                
            } catch (ClassCastException | NumberFormatException e) {
                System.err.println("Error parsing student data: " + e.getMessage());
                sendResponse(exchange, 400, SimpleJSON.createErrorJson("Invalid student data format"));
            } catch (Exception e) {
                System.err.println("Error adding student: " + e.getMessage());
                sendResponse(exchange, 400, SimpleJSON.createErrorJson("Invalid student data"));
            }
        }
    }
    
    // Handler for static files (HTML, CSS, JS)
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            
            // Default to index.html
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            // Map file extensions to content types
            String contentType = getContentType(path);
            
            // Try to serve file from frontend directory
            File file = new File("frontend" + path);
            
            if (file.exists() && file.isFile()) {
                // Set content type header
                exchange.getResponseHeaders().set("Content-Type", contentType);
                
                // Send file
                exchange.sendResponseHeaders(200, file.length());
                try (OutputStream os = exchange.getResponseBody();
                     FileInputStream fis = new FileInputStream(file)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = fis.read(buffer)) != -1) {
                        os.write(buffer, 0, bytesRead);
                    }
                }
            } else {
                // File not found
                String response = "File not found: " + path;
                sendResponse(exchange, 404, response);
            }
        }
        
        private String getContentType(String path) {
            if (path.endsWith(".html")) return "text/html";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            if (path.endsWith(".json")) return "application/json";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            if (path.endsWith(".ico")) return "image/x-icon";
            return "text/plain";
        }
    }
    
    // Helper methods
    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] responseBytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
    
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }
}