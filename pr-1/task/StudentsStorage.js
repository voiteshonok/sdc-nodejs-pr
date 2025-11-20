const { Student } = require('./Student');

class StudentsStorage{
  #students = [
    new Student("1", "John Doe", 20, 2),
    new Student("2", "Jane Smith", 23, 3),
    new Student("3", "Mike Johnson", 18, 2),
  ];

  #getLastId() {
    if (this.#students.length === 0) return 0;

    const lastId = this.#students[this.#students.length-1].id;

    return Number(lastId);
  }

  addStudent(name, age, group) {
    const lastId = this.#getLastId();
    const newId = String(lastId + 1);

    this.#students.push(new Student(newId, name, age, group));
  }

  removeStudent(id) {
    const student = this.#students.find(student => student.id === id);

    if (!student) {
        throw new Error(`Student with id ${id} not found`);
    }

    this.#students = this.#students.filter(student => student.id !== id);
  }

  getStudentById(id) {
    return this.#students.find(s => s.id === id) || null;
  }

  getStudentsByGroup(group) {
    return this.#students.filter(s => s.group === group);
  }

  getAllStudents() {
    return this.#students;
  }

  calculateAverageAge() {
    return Math.floor(this.#students.reduce((acc, student) => acc + student.age, 0) / this.#students.length);
  }
}

module.exports = {StudentsStorage}



