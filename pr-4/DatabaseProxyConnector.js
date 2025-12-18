const db = require('./models');
const EventEmitter = require('events');
const { STUDENT_EVENTS } = require('../pr-2/task/events');


class DatabaseProxyConnector extends EventEmitter {
  constructor(sequelizeInstance = db) {
    super();
    this.db = sequelizeInstance;
    this.sequelize = sequelizeInstance.sequelize;
    this.Student = sequelizeInstance.Student;
    this._connected = false;
  }

  async ensureConnected() {
    if (!this._connected) {
      await this.sequelize.authenticate();
      this._connected = true;
    }
  }

  async getAllStudents() {
    await this.ensureConnected();
    const students = await this.Student.findAll({
      order: [['id', 'ASC']],
      raw: true,
    });
    this.emit(STUDENT_EVENTS.ALL_RETRIEVED, students);
    return students;
  }

  async getStudentById(id) {
    await this.ensureConnected();
    const student = await this.Student.findByPk(id, { raw: true });
    this.emit(STUDENT_EVENTS.RETRIEVED, { id, student });
    return student || null;
  }

  async createStudent({ name, age, group }) {
    await this.ensureConnected();

    const created = await this.Student.create(
      { name, age, group },
      { returning: true }
    );

    const plain = created.get({ plain: true });
    this.emit(STUDENT_EVENTS.ADDED, plain);
    return plain;
  }

  async updateStudent(id, { name, age, group }) {
    await this.ensureConnected();

    const student = await this.Student.findByPk(id);
    if (!student) {
      return null;
    }

    student.name = name;
    student.age = age;
    student.group = group;

    const saved = await student.save();
    const plain = saved.get({ plain: true });
    return plain;
  }

  async deleteStudent(id) {
    await this.ensureConnected();

    const student = await this.Student.findByPk(id);
    if (!student) {
      const err = new Error(`Student with id ${id} not found`);
      this.emit(STUDENT_EVENTS.REMOVAL_FAILED, id, err);
      return null;
    }

    const plain = student.get({ plain: true });
    await student.destroy();
    this.emit(STUDENT_EVENTS.REMOVED, plain);
    return plain;
  }

  async getStudentsByGroup(group) {
    await this.ensureConnected();
    const students = await this.Student.findAll({
      where: { group },
      order: [['id', 'ASC']],
      raw: true,
    });
    this.emit(STUDENT_EVENTS.BY_GROUP_RETRIEVED, { group, students });
    return students;
  }

  async calculateAverageAge() {
    await this.ensureConnected();
    const result = await this.Student.findAll({
      attributes: [
        [this.sequelize.fn('AVG', this.sequelize.col('age')), 'averageAge'],
      ],
      raw: true,
    });
    const avg = Math.floor(result[0].averageAge);
    this.emit(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, avg);
    return avg;
  }
}

module.exports = { DatabaseProxyConnector };



