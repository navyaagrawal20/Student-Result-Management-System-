

public class Student {
    private int rollNo;
    private String name;
    private int subject1, subject2, subject3;
    private int total;
    private float percentage;
    private String grade;

    public Student(int rollNo, String name, int subject1, int subject2, int subject3) {
        this.rollNo = rollNo;
        this.name = name;
        this.subject1 = subject1;
        this.subject2 = subject2;
        this.subject3 = subject3;
    }

    // Getters and setters
    public int getRollNo() { return rollNo; }
    public String getName() { return name; }
    public int getSubject1() { return subject1; }
    public int getSubject2() { return subject2; }
    public int getSubject3() { return subject3; }
    public int getTotal() { return total; }
    public float getPercentage() { return percentage; }
    public String getGrade() { return grade; }

    public void setTotal(int total) { this.total = total; }
    public void setPercentage(float percentage) { this.percentage = percentage; }
    public void setGrade(String grade) { this.grade = grade; }
}
