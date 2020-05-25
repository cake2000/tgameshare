import { Classes, Persons } from '../../../lib/collections';
import { USER_TYPES } from '../../../lib/enum';

const prepareTeacherData = () => {
  let teacherProfile = {};
  let classObj = {};
  let classObj1 = {};
  let classObj2 = {};
  let classObj3 = {};
  let classId = '';
  let classId1 = '';
  let classId2 = '';
  let classId3 = '';

  Classes.remove({});

  // Teacher 1
  classObj = {
    class_id: 'TestAI1_ExampleClass',
    name: 'ExampleClass',
    numbOfStudents: 5,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'TestAI1'
  };
  classObj1 = {
    class_id: 'TestAI1_ExampleClass1',
    name: 'ExampleClass1',
    numbOfStudents: 5,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'TestAI1'
  };
  classObj2 = {
    class_id: 'TestAI1_ExampleClass2',
    name: 'ExampleClass2',
    numbOfStudents: 5,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'TestAI1'
  };
  classObj3 = {
    class_id: 'TestAI1_ExampleClass3',
    name: 'ExampleClass3',
    numbOfStudents: 5,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'TestAI1'
  };

  const inClasses = [
    { classId, status: "Approved" },
    { classId: classId1, status: "Approved" },
    { classId: classId2, status: "Approved" },
    { classId: classId3, status: "Approved" },
  ];
  Meteor.users.update(
    { _id: 'TestAI5' },
    {
      $set: { 'profile.inClasses': inClasses }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI6' },
    {
      $set: { 'profile.inClasses': inClasses }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI7' },
    {
      $set: { 'profile.inClasses': inClasses }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI8' },
    {
      $set: { 'profile.inClasses': inClasses }
    }
  );

  teacherProfile = {
    teacherType: 1,
    address: '38 NVT street',
    city: 'HCMC',
    phone: '0947473488',
    schoolName: 'Havard',
    state: 'HCM',
    zipCode: '70000',
    imageInfo: {
      title: 'Picture of Certificate',
      size: 931187,
      url: "data:image/jpeg;base64,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…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",
    },
    classList: [classId, classId1, classId2, classId3]
  };

  // Persons.remove({});

  Persons.update(
    { userId: 'TestAI1' },
    {
      $addToSet: { type: USER_TYPES.TEACHER },
      $set: { teacherProfile }
    }
  );


  // Teacher 2
  classObj = {
    class_id: 'TestAI2_ExampleClass2',
    name: 'ExampleClass2',
    numbOfStudents: 5,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'TestAI2'
  };

  classId = Classes.insert(classObj);

  Meteor.users.update(
    { _id: 'TestAI10' },
    {
      $set: { 'profile.inClasses': [{ classId, status: "Approved" }] }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI11' },
    {
      $set: { 'profile.inClasses': [{ classId, status: "Approved" }] }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI12' },
    {
      $set: { 'profile.inClasses': [{ classId, status: 0 }] }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI13' },
    {
      $set: { 'profile.inClasses': [{ classId, status: 0 }] }
    }
  );
  Meteor.users.update(
    { _id: 'TestAI14' },
    {
      $set: { 'profile.inClasses': [{ classId, status: "Approved" }] }
    }
  );

  teacherProfile = {
    teacherType: 2,
    afterSchoolName: 'Zigvy University',
    address: '38 NVT street',
    city: 'HCMC',
    phone: '0947473488',
    schoolName: 'Havard',
    state: 'HCM',
    zipCode: '70000',
    note: '',
    classList: [classId]
  };

  Persons.update(
    { userId: 'TestAI2' },
    {
      $addToSet: { type: USER_TYPES.TEACHER },
      $set: { teacherProfile }
    }
  );

  // Teacher 3


  const newUsers = [];
  newUsers.push({ username: "scottallison", firstName: "Scott", lastName: "Allison", grade: 6, gender: "M" });
  newUsers.push({ username: "jimanderson", firstName: "Jim", lastName: "Anderson", grade: 7, gender: "M" });
  newUsers.push({ username: "lindaarmstrong", firstName: "Linda", lastName: "Armstrong", grade: 8, gender: "F" });
  // newUsers.push({ username: "jackbrown", firstName: "Jack", lastName: "Brown", grade: 7, gender: "M" });
  newUsers.push({ username: "cindycole", firstName: "Cindy", lastName: "Cole", grade: 6, gender: "F" });
  newUsers.push({ username: "harveyfischer", firstName: "Harvey", lastName: "Fischer", grade: 6, gender: "M" });
  newUsers.push({ username: "sandragraham", firstName: "Sandra", lastName: "Graham", grade: 8, gender: "F" });
  newUsers.push({ username: "frankharrison", firstName: "Frank", lastName: "Harrison", grade: 8, gender: "M" });
  newUsers.push({ username: "gloriajonas", firstName: "Gloria", lastName: "Jonas", grade: 7, gender: "F" });
  newUsers.push({ username: "stevenewman", firstName: "Steve", lastName: "Newman", grade: 8, gender: "M" });


  classObj = {
    class_id: 'AlphaPool_Fall2018',
    name: 'Fall2018',
    numbOfStudents: 6,
    createdTime: new Date(),
    game: 'uN9W4QhmdKu94Qi2Y',
    owner: 'kEmnDrYssC2gKNDxx',
    users: []
  };

  for(let k=0; k<6; k++) {
    const userId = Meteor.users.findOne({username: newUsers[k].username})._id;
    classObj.users.push(userId);
  }

  classId = Classes.insert(classObj);


  for(let k=0; k<6; k++) {
    const nu = newUsers[k];
    Meteor.users.update(
      { username: nu.username },
      {
        $set: { 'profile.inClasses': [{ classId, status: "Approved" }] }
      }
    );  
  }

  teacherProfile = {
    teacherType: 3,
    address: '38 NVT street',
    city: 'HCMC',
    phone: '0998343443',
    schoolName: 'Havard',
    state: 'HCM',
    zipCode: '70000',
    note: '',
    classList: [classId]
  };

  Persons.update(
    { userId: 'kEmnDrYssC2gKNDxx' },
    {
      $addToSet: { type: USER_TYPES.TEACHER },
      $set: { teacherProfile }
    }
  );
};

export default prepareTeacherData;
