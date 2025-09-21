// Simple JSON utility class for the SRMS project
import java.util.*;
import java.util.regex.*;

public class SimpleJSON {
    
    // Convert Student object to JSON string
    public static String toJson(Student student) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"rollNo\":").append(student.getRollNo()).append(",");
        json.append("\"name\":\"").append(escapeString(student.getName())).append("\",");
        json.append("\"subject1\":").append(student.getSubject1()).append(",");
        json.append("\"subject2\":").append(student.getSubject2()).append(",");
        json.append("\"subject3\":").append(student.getSubject3()).append(",");
        json.append("\"total\":").append(student.getTotal()).append(",");
        json.append("\"percentage\":").append(student.getPercentage()).append(",");
        json.append("\"grade\":\"").append(student.getGrade()).append("\"");
        json.append("}");
        return json.toString();
    }
    
    // Convert list of students to JSON array
    public static String toJsonArray(List<Student> students) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < students.size(); i++) {
            if (i > 0) json.append(",");
            json.append(toJson(students.get(i)));
        }
        json.append("]");
        return json.toString();
    }
    
    // Parse JSON string to extract student data
    public static Map<String, Object> parseStudentJson(String jsonString) {
        Map<String, Object> data = new HashMap<>();
        
        // Remove outer braces
        jsonString = jsonString.trim();
        if (jsonString.startsWith("{")) {
            jsonString = jsonString.substring(1);
        }
        if (jsonString.endsWith("}")) {
            jsonString = jsonString.substring(0, jsonString.length() - 1);
        }
        
        // Split by commas (simple approach)
        String[] pairs = jsonString.split(",");
        
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                String key = keyValue[0].trim().replaceAll("\"", "");
                String value = keyValue[1].trim();
                
                // Parse different data types
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    // String value
                    data.put(key, value.substring(1, value.length() - 1));
                } else {
                    // Numeric value
                    try {
                        if (value.contains(".")) {
                            data.put(key, Double.parseDouble(value));
                        } else {
                            data.put(key, Integer.parseInt(value));
                        }
                    } catch (NumberFormatException e) {
                        data.put(key, value);
                    }
                }
            }
        }
        
        return data;
    }
    
    // Escape special characters in strings
    private static String escapeString(String str) {
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
    
    // Create error JSON response
    public static String createErrorJson(String message) {
        return "{\"error\":\"" + escapeString(message) + "\"}";
    }
    
    // Create success JSON response
    public static String createSuccessJson(String message) {
        return "{\"success\":\"" + escapeString(message) + "\"}";
    }
}