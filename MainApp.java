import java.util.*;
import java.sql.*;

public class MainApp {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        while (true) {
            System.out.println("\n===== Student Result Management System =====");
            System.out.println("1. Add Student Record");
            System.out.println("2. Search Student (by Roll No)");
            System.out.println("3. Display All Students");
            System.out.println("4. Exit");
            System.out.print("Enter choice: ");
            int choice = sc.nextInt();

            switch (choice) {
                case 1:
                    System.out.print("Enter Roll No: ");
                    int rollNo = sc.nextInt();
                    sc.nextLine();
                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();
                    System.out.print("Enter Marks (3 subjects): ");
                    int s1 = sc.nextInt(), s2 = sc.nextInt(), s3 = sc.nextInt();

                    Student st = new Student(rollNo, name, s1, s2, s3);
                    ResultCalculator.calculateResult(st);
                    DatabaseHandler.insertStudent(st);
                    break;

                case 2:
                    // Call search function (to be implemented)
                    break;

                case 3:
                    // Call display function (to be implemented)
                    break;

                case 4:
                    System.out.println("Exiting... Goodbye!");
                    sc.close();
                    return;

                default:
                    System.out.println("❌ Invalid choice!");
            }
        }
    }
}
