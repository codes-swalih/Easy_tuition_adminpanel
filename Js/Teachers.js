// Import Firebase modules
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
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

// Initialize EmailJS with your public key
emailjs.init('zGCE5rZPX30z6gRUJ'); // Replace with your Public Key

const teachersContainer = document.getElementById('teachers-container');

// Adding a heading for unverified teachers
const heading = document.createElement('h1');
heading.classList.add('text-2xl', 'font-bold', 'mb-4');
heading.textContent = "Teacher New Joining Requests";
teachersContainer.appendChild(heading);

// Create container for unverified teachers cards
const unverifiedContainer = document.createElement('div');
unverifiedContainer.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'gap-4');
unverifiedContainer.id = 'unverified-teachers-container';
teachersContainer.appendChild(unverifiedContainer);

// Adding a heading for approved teachers
const approvedHeading = document.createElement('h1');
approvedHeading.classList.add('text-2xl', 'font-bold', 'mt-8', 'mb-4');
approvedHeading.textContent = "Approved Teachers";
teachersContainer.appendChild(approvedHeading);

// Create container for approved teachers cards
const approvedContainer = document.createElement('div');
approvedContainer.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'gap-4');
approvedContainer.id = 'approved-teachers-container';
teachersContainer.appendChild(approvedContainer);

// Fetch teachers from database
get(ref(database, 'teachers')).then(snapshot => {
    const teachers = snapshot.val();
    const unverifiedContainer = document.getElementById('unverified-teachers-container');
    const approvedContainer = document.getElementById('approved-teachers-container');

    for (const phoneNumber in teachers) {
        const teacher = teachers[phoneNumber];
        
        const teacherCard = document.createElement('div');
        teacherCard.classList.add('p-4', 'bg-white', 'shadow', 'rounded-lg', 'mb-4');

        if (!teacher.accountVerified) {
            teacherCard.innerHTML = `
                <h2 class="text-xl font-semibold">${teacher.personalDetails.fullName}</h2>
                <p>Email: ${teacher.email}</p>
                <p>Phone: ${phoneNumber}</p>
                <p>Account Verified: ${teacher.accountVerified ? 'Yes' : 'No'}</p>
                <img src="${teacher.personalDetails.passportPhotoURL}" alt="Passport Photo" class="w-24 h-24 object-cover rounded-full mt-2 mb-4">
                <div class="flex gap-2">
                    <button class="view-details-btn bg-blue-500 text-white py-1 px-4 rounded-lg">View Details</button>
                    <button class="approve-btn bg-green-500 text-white py-1 px-4 rounded-lg">Approve</button>
                    <button class="reject-btn bg-red-500 text-white py-1 px-4 rounded-lg">Reject</button>
                </div>
            `;

            const approveBtn = teacherCard.querySelector('.approve-btn');
            approveBtn.addEventListener('click', () => {
                update(ref(database, `teachers/${phoneNumber}`), {
                    accountVerified: true
                }).then(() => {
                    sendEmail(teacher.email,  'Teacher Status Update', 'Congratulations! Your status as a teacher has been approved.');
                    alert(`${teacher.personalDetails.fullName} has been approved as a teacher.`);
                    teacherCard.remove(); // Remove the teacher's card from the DOM after approval
                    addTeacherToApproved(teacherCard, teacher, phoneNumber);
                }).catch(error => {
                    console.error('Error updating teacher status: ', error);
                });
            });

            const rejectBtn = teacherCard.querySelector('.reject-btn');
            rejectBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to reject ${teacher.personalDetails.fullName}?`)) {
                    remove(ref(database, `teachers/${phoneNumber}`)).then(() => {
                        sendEmail(teacher.email, 'Teacher Status Update', 'Sorry, your application to become a teacher in Easy Tuition has been rejected.');
                        alert(`${teacher.personalDetails.fullName} has been rejected.`);
                        teacherCard.remove(); // Remove the teacher's card from the DOM after rejection
                    }).catch(error => {
                        console.error('Error removing teacher: ', error);
                    });
                }
            });

            const viewDetailsBtn = teacherCard.querySelector('.view-details-btn');
            viewDetailsBtn.addEventListener('click', () => {
                window.location.href = `view-teacher-details.html?phone=${encodeURIComponent(phoneNumber)}`;
            });

            unverifiedContainer.appendChild(teacherCard);
        } else {
            teacherCard.innerHTML = `
                <h2 class="text-xl font-semibold">${teacher.personalDetails.fullName}</h2>
                <p>Email: ${teacher.email}</p>
                <p>Phone: ${phoneNumber}</p>
                <div class="flex gap-2">
                    <button class="view-details-btn bg-blue-500 text-white py-1 px-4 rounded-lg">View Details</button>
                </div>
            `;

            const viewDetailsBtn = teacherCard.querySelector('.view-details-btn');
            viewDetailsBtn.addEventListener('click', () => {
                window.location.href = `view-teacher-details.html?phone=${encodeURIComponent(phoneNumber)}`;
            });

            approvedContainer.appendChild(teacherCard);
        }
    }
}).catch(error => {
    console.error('Error fetching teachers: ', error);
});

// Function to send email using EmailJS
function sendEmail(toEmail, subject, message) {
    emailjs.send('service_1n33u9q', 'template_4gu43yv', {
        to_email: toEmail,
        subject: subject,
        message: message
    }).then(response => {
        console.log('Email sent successfully:', response);
    }).catch(error => {
        console.error('Error sending email:', error);
    });
}

// Function to add teacher to approved container
function addTeacherToApproved(teacherCard, teacher, phoneNumber) {
    const approvedContainer = document.getElementById('approved-teachers-container');
    teacherCard.innerHTML = `
        <h2 class="text-xl font-semibold">${teacher.personalDetails.fullName}</h2>
        <p>Email: ${teacher.email}</p>
        <p>Phone: ${phoneNumber}</p>
        <div class="flex gap-2">
            <button class="view-details-btn bg-blue-500 text-white py-1 px-4 rounded-lg">View Details</button>
        </div>
    `;

    const viewDetailsBtn = teacherCard.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => {
        window.location.href = `view-teacher-details.html?phone=${encodeURIComponent(phoneNumber)}`;
    });

    approvedContainer.appendChild(teacherCard);
}
