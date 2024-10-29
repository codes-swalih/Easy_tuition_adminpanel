import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, remove, set, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmcSLnzLFs8wvFh5vH3B82D1KFLFkbpm8",
    authDomain: "easy-tuition-dac4a.firebaseapp.com",
    projectId: "easy-tuition-dac4a",
    storageBucket: "easy-tuition-dac4a.appspot.com",
    messagingSenderId: "873415270262",
    appId: "1:873415270262:web:bda429aa2747af38346457",
    measurementId: "G-T286R1DSHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', async function() {
    const pendingPaymentsContainer = document.getElementById('pending-payments-container');
    const paymentsRef = ref(database, 'pending-payments');

    try {
        const snapshot = await get(paymentsRef);
        if (snapshot.exists()) {
            const payments = snapshot.val();
            for (const paymentID in payments) {
                const payment = payments[paymentID];
                payment.paymentID = paymentID;
                await fetchTeacherAndStudentData(payment.teacherUserID, payment.studentUserID, payment, pendingPaymentsContainer);
            }
        } else {
            console.log("No pending payments found.");
            pendingPaymentsContainer.innerHTML = "<p>No pending payments found.</p>";
        }
    } catch (error) {
        console.error("Error fetching pending payments:", error);
    }
});

async function fetchTeacherAndStudentData(teacherID, studentID, payment, container) {
    const teacherPersonalRef = ref(database, `teachers/${teacherID}/personalDetails`);
    const teacherPhoneRef = ref(database, `teachers/${teacherID}/phone`);
    const studentPersonalRef = ref(database, `students/${studentID}/personalDetails`);
    const studentPhoneRef = ref(database, `students/${studentID}/phone`);

    try {
        const [teacherPersonalSnapshot, teacherPhoneSnapshot, studentPersonalSnapshot, studentPhoneSnapshot] = 
            await Promise.all([
                get(teacherPersonalRef), 
                get(teacherPhoneRef),
                get(studentPersonalRef), 
                get(studentPhoneRef)
            ]);

        const teacherData = teacherPersonalSnapshot.exists() ? teacherPersonalSnapshot.val() : null;
        const studentData = studentPersonalSnapshot.exists() ? studentPersonalSnapshot.val() : null;

        if (teacherData && studentData) {
            teacherData.phone = teacherPhoneSnapshot.exists() ? teacherPhoneSnapshot.val() : 'N/A';
            studentData.phone = studentPhoneSnapshot.exists() ? studentPhoneSnapshot.val() : 'N/A';
            createPaymentBox(teacherData, studentData, payment, container);
        } else {
            console.log(`No data found for teacherID: ${teacherID} or studentID: ${studentID}`);
        }
    } catch (error) {
        console.error("Error fetching teacher or student data:", error);
    }
}

function convertTo24HourTime(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes, seconds] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
        hours = (parseInt(hours, 10) + 12).toString();
    } else if (modifier === 'AM' && hours === '12') {
        hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}

function createPaymentBox(teacherData, studentData, payment, container) {
    const box = document.createElement('div');
    box.className = "bg-white p-6 rounded-lg shadow-md mb-4";

    box.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <!-- Teacher Section -->
            <div class="flex items-center">
                <img src="${teacherData.passportPhotoURL}" alt="${teacherData.fullName}" class="w-16 h-16 rounded-full mr-4">
                <div>
                    <h3 class="text-xl font-bold">Teacher: ${teacherData.fullName}</h3>
                    <p class="text-gray-600">Phone: ${teacherData.phone}</p>
                    <p class="text-gray-600">Primary Language: ${teacherData.primaryLanguage}</p>
                </div>
            </div>

            <!-- Student Section -->
            <div class="flex items-center">
                <img src="${studentData.passportPhotoURL}" alt="${studentData.fullName}" class="w-16 h-16 rounded-full mr-4">
                <div>
                    <h3 class="text-xl font-bold">Student: ${studentData.fullName}</h3>
                    <p class="text-gray-600">Student ID: ${payment.studentUserID}</p>
                    <p class="text-gray-600">Phone: ${studentData.phone}</p>
                </div>
            </div>
        </div>

        <!-- Payment Details Section -->
        <div class="border-t pt-4 mt-4">
            <p class="mb-1"><strong>Subject:</strong> ${payment.subject}</p>
            <p class="mb-1"><strong>Board:</strong> ${payment.board}</p>
            <p class="mb-1"><strong>Date:</strong> ${payment.paymentDate}</p>
            <p class="mb-1"><strong>Time:</strong> ${payment.paymentTime}</p>
            <p class="mb-1"><strong>Class Time:</strong> ${payment.timeSlot}</p>
            <p class="mb-1"><strong>Day/Night:</strong> ${payment.timeSlotType}</p>
            <p class="text-red-500"><strong>Payment Status:</strong> ${payment.paymentApproved ? 'Approved' : 'Pending'}</p>
        </div>
        
        <div class="mt-4 flex justify-end">
            <button class="bg-red-500 text-white px-4 py-2 rounded mr-2 delete-btn">Delete</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded approve-btn">Approve</button>
        </div>
    `;

    container.appendChild(box);

    // Delete functionality
    const deleteBtn = box.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
        if (confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
            try {
                await remove(ref(database, `pending-payments/${payment.paymentID}`));
                box.remove();
                alert("Payment deleted successfully!");
            } catch (error) {
                console.error("Error deleting payment:", error);
                alert("Failed to delete payment. Please try again.");
            }
        }
    });

    // Approve functionality
    const approveBtn = box.querySelector('.approve-btn');
    approveBtn.addEventListener('click', async () => {
        try {
            console.log("Payment object:", payment); // Log the entire payment object

            if (!payment.paymentTime || !payment.paymentDate) {
                throw new Error("Payment time or date is missing");
            }

            // Adjusting date format to 'YYYY-MM-DD' for compatibility
            const [month, day, year] = payment.paymentDate.split('/');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const formattedTime = convertTo24HourTime(payment.paymentTime);
            const dateTimeString = `${formattedDate}T${formattedTime}`;

            console.log("DateTime String:", dateTimeString); // Log the combined date-time string

            const paymentDate = new Date(dateTimeString);
            if (isNaN(paymentDate.getTime())) {
                throw new Error("Invalid payment date/time format");
            }

            const expiryDate = new Date(paymentDate);
            expiryDate.setDate(paymentDate.getDate() + 30);

            const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

            const classData = {
                teacherUserID: payment.teacherUserID,
                studentUserID: payment.studentUserID,
                paymentDays: payment.paymentDays || [],  // Use an empty array if paymentDays is not present
                startDate: currentDate, // Current date as start date
                expiryDate: expiryDate.toISOString().split('T')[0],
                classWorking: true,
                board: payment.board || "N/A", // Default value if board is undefined
                subject: payment.subject || "N/A", // Default value if subject is undefined
                timeSlot: payment.timeSlot || "N/A", // Default value if timeSlot is undefined
                timeSlotType: payment.timeSlotType || "N/A" // Default value if timeSlotType is undefined
            };
            

            console.log("Class data to be inserted:", classData); // Log the class data

            const newClassRef = ref(database, 'Classes');
            const newClassKey = push(newClassRef).key;
            
            if (!newClassKey) {
                throw new Error("Failed to generate new class key");
            }

            await set(ref(database, `Classes/${newClassKey}`), classData);

            await remove(ref(database, `pending-payments/${payment.paymentID}`));
            box.remove();
            alert("Payment approved and class created successfully!");

        } catch (error) {
            console.error("Error approving payment:", error);
            alert("Failed to approve payment. Please check the console for more details.");
        }
    });
}
