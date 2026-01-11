const db = require('../../models');
const EventEmitter = require('events');
const bcrypt = require('bcrypt');
const { STUDENT_EVENTS } = require('../../../pr-2/task/events');


class UserService extends EventEmitter {
  constructor(sequelizeInstance = db) {
    super();
    this.db = sequelizeInstance;
    this.sequelize = sequelizeInstance.sequelize;
    this.Student = sequelizeInstance.Student;
    this.User = sequelizeInstance.User;
    this.Role = sequelizeInstance.Role;
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

  // User authentication methods
  async getUserByEmail(email) {
    await this.ensureConnected();
    const user = await this.User.findOne({
      where: { email },
      raw: true
    });
    return user || null;
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async getRoleNameByRoleId(roleId) {
    await this.ensureConnected();
    const role = await this.Role.findOne({
      where: { role_id: roleId },
      raw: true
    });
    return role ? role.role_name : null;
  }

  async getUserWithRoleByEmail(email) {
    await this.ensureConnected();
    const user = await this.User.findOne({
      where: { email },
      raw: true
    });

    if (!user) {
      return null;
    }

    const roleName = await this.getRoleNameByRoleId(user.role);

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      role: user.role,
      role_name: roleName
    };
  }

  async getAllUsers() {
    await this.ensureConnected();
    const users = await this.User.findAll({
      order: [['id', 'ASC']],
      raw: true
    });

    // Get role names for all users
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roleName = await this.getRoleNameByRoleId(user.role);
        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          role_name: roleName
        };
      })
    );

    return usersWithRoles;
  }

  async createUser(name, surname, email, password, roleId) {
    await this.ensureConnected();

    // Check if user with email already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const created = await this.User.create({
      name,
      surname,
      email,
      password,
      role: roleId
    }, {
      returning: true
    });

    const plain = created.get({ plain: true });
    
    // Get role name
    const roleName = await this.getRoleNameByRoleId(roleId);

    return {
      id: plain.id,
      name: plain.name,
      surname: plain.surname,
      email: plain.email,
      role: plain.role,
      role_name: roleName
    };
  }
}

module.exports = { UserService };



