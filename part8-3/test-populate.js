const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    }
})

// lookup: string // O(N)
// lookup: id     // O(1)

//Student.find({}).populate("classes");
// lookup: { from: <collection>, localField: <field>, foreignField: <field>, as: <output> }

// from -> ref: Class
// localField -> argument of populate
// foreignField -> _id of ref
// as -> argument of populate

const classSchema = new mongoose.Schema({
    title: String,
    description: String
})

const TeacherSchema = new mongoose.Schema({
    teacher: String,
    subject: String
})
// const hairColourSchema = new mongoose.Schema({
//     colour: String, 
//     persons: [String]
// })

const Student = mongoose.model('Student', studentSchema);
const Class = mongoose.model('Class', classSchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);

// const HairColour = mongoose.model('HairColour', hairColourSchema);

const main = async () => {
    const url = 'mongodb://localhost:27017/test-db'
    await mongoose.connect(url);
    console.log('connected to: ', url)

    const classDoc = new Class({
        title: 'math',
        description: 'boring'
    })
    const savedClass = await classDoc.save();

    const teacherDoc = new Teacher({
        teacher: 'Simon',
        subject: 'math'
    })
    const savedTeacher = await teacherDoc.save();


    const studentDoc = new Student({
        name: 'Raghad',
        age: 12,
        classes: [savedClass._id],
        teacher: savedTeacher._id
    });

    await studentDoc.save();


    const students = await Student.find({});
    students.forEach((student) => {
        console.log(student);
    });

    // const popStudents = await Student.find({}).populate("classes");
     const popStudents = await Student.find({}).populate("classes").populate("teacher");
    popStudents.forEach((student) => {
        console.log(student);
    });


    // const studentDoc2 = new Student({
    //     name: 'Bat',
    //     age: 12,
    //     classes: [savedClass._id]
    // });
    // await studentDoc2.save();

    // const HairColourDoc = new HairColour({
    //     persons: [ 'Raghad', 'Bat' ],
    //     colour: 'green',
    // })
    // await HairColourDoc.save();

    mongoose.disconnect();
}

main();