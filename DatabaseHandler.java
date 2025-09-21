import java.sql.*;

public class DatabaseHandler {
    private static final String URL = "jdbc:mysql://localhost:3306/srms";
    private static final String USER = "root";
    private static final String PASSWORD = "password";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void insertStudent(Student student) {
        try (Connection conn = getConnection()) {
            String sql = "INSERT INTO students VALUES(?,?,?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, student.getRollNo());
            ps.setString(2, student.getName());
            ps.setInt(3, student.getSubject1());
            ps.setInt(4, student.getSubject2());
            ps.setInt(5, student.getSubject3());
            ps.setInt(6, student.getTotal());
            ps.setFloat(7, student.getPercentage());
            ps.executeUpdate();
            System.out.println("✅ Student inserted successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Add methods for update, delete, search, sort as needed
}
