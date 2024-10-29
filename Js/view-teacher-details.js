import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmcSLnzLFs8wvFh5vH3B82D1KFLFkbpm8",
  authDomain: "easy-tuition-dac4a.firebaseapp.com",
  databaseURL: "https://easy-tuition-dac4a-default-rtdb.firebaseio.com",
  projectId: "easy-tuition-dac4a",
  storageBucket: "easy-tuition-dac4a.appspot.com",
  messagingSenderId: "873415270262",
  appId: "1:873415270262:web:bda429aa2747af38346457",
  measurementId: "G-T286R1DSHZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const phoneNumber = urlParams.get('phone');

const teacherDetailsContainer = document.getElementById('teacher-details');

if (phoneNumber) {
    get(ref(database, `teachers/${phoneNumber}`)).then(snapshot => {
        const teacher = snapshot.val();
        if (teacher) {
            teacherDetailsContainer.innerHTML = `
                <h2 class="text-xl font-semibold">${teacher.name}</h2>
                <p><strong>Full Name:</strong> ${teacher.personalDetails.fullName}</p>
                <p><strong>Email:</strong> ${teacher.email}</p>
                <p><strong>Phone:</strong> ${teacher.personalDetails.phone}</p>
                <p><strong>Date of Birth:</strong> ${teacher.personalDetails.dob}</p>
                <p><strong>Address:</strong> ${teacher.personalDetails.address}</p>
                <p><strong>State:</strong> ${teacher.personalDetails.state}</p>
                <p><strong>Pincode:</strong> ${teacher.personalDetails.pincode}</p>
                <p><strong>Primary Language:</strong> ${teacher.personalDetails.primaryLanguage}</p>
                <p><strong>Secondary Language:</strong> ${teacher.personalDetails.secondaryLanguage}</p>
                <div class="mb-4">
                    <strong>Time Slots:</strong>
                    <ul>
                        ${Object.values(teacher.timeSlots?.AM || {}).map(slot => `<li>${slot}</li>`).join('')}
                        ${Object.values(teacher.timeSlots?.PM || {}).map(slot => `<li>${slot}</li>`).join('')}
                    </ul>
                </div>
                <div class="mb-4">
                    <strong>Introduction:</strong>
                    <p>${teacher.introduction.introductionText}</p>
                </div>
                <div class="mb-4">
                    <strong>Demo Video:</strong>
                    <video controls src="${teacher.introduction.demoVideoURL}" class="w-full mt-2"></video>
                </div>
                <div class="mb-4">
                    <strong>Passport Photo:</strong>
                    <img src="${teacher.personalDetails.passportPhotoURL}" alt="Passport Photo" class="mt-2 w-32 h-32 object-cover">
                </div>





                
                // <div class="mb-4">
                //     <strong>Classes and Boards:</strong>
                //     ${teacher.classes ? teacher.classes.map((classItem, index) => `
                //         <div>
                //             <h3>Class: ${classItem.class}</h3>
                //             <ul>
                //                 ${Object.entries(classItem.boards || {}).map(([board, subjects]) => `
                //                     <li><strong>${board}:</strong>
                //                         <ul>
                //                             ${subjects.map(subject => `<li>${subject}</li>`).join('')}
                //                         </ul>
                //                     </li>
                //                 `).join('')}
                //             </ul>
                //         </div>
                //     `).join('') : '<p>No classes available.</p>'}
                // </div>



                






                






<div class="mb-8">
    <strong class="text-xl font-bold">Classes and Boards:</strong>
    ${teacher.classDetails && teacher.classDetails.classes.length > 0 ?
        teacher.classDetails.classes.map((classItem) => `
            <div class="mt-4 p-4 border rounded-lg shadow-md bg-white">
                <h3 class="text-lg font-semibold text-gray-800">Class: ${classItem.class}</h3>
                <ul class="mt-2">
                    ${Array.isArray(classItem.boards) && classItem.boards.length > 0 ?
                        classItem.boards.map((boardItem) => `
                            <li class="mt-2">
                                <strong class="text-md text-blue-600">${boardItem.board}:</strong>
                                <ul class="mt-1 list-disc list-inside">
                                    ${Array.isArray(boardItem.subjects) && boardItem.subjects.length > 0 ? 
                                        boardItem.subjects.map(subject => `
                                            <li class="text-gray-700">${subject}</li>
                                        `).join('') : 
                                        '<li class="text-gray-500">No subjects available.</li>'
                                    }
                                </ul>
                            </li>
                        `).join('') : 
                        '<li class="text-gray-500">No boards available.</li>'
                    }
                </ul>
            </div>
        `).join('') : '<p class="text-gray-500">No classes available.</p>'
    }
</div>











                <p><strong>Account Verified:</strong> ${teacher.accountVerified ? 'Yes' : 'No'}</p>
            `;
        } else {
            teacherDetailsContainer.innerHTML = '<p>No details found for this teacher.</p>';
        }
    }).catch(error => {
        console.error('Error fetching teacher details: ', error);
        teacherDetailsContainer.innerHTML = '<p>Error fetching teacher details.</p>';
    });
} else {
    teacherDetailsContainer.innerHTML = '<p>No phone number provided.</p>';
}
