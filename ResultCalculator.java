public class ResultCalculator {

    public static void calculateResult(Student student) {
        int total = student.getSubject1() + student.getSubject2() + student.getSubject3();
        float percentage = total / 3.0f;
        String grade;

        if (percentage >= 90) grade = "A+";
        else if (percentage >= 75) grade = "A";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 40) grade = "C";
        else grade = "F";

        student.setTotal(total);
        student.setPercentage(percentage);
        student.setGrade(grade);
    }
}
