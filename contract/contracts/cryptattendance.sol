// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.7;

contract Cryptattendance {

    address public instructor;
    string public courseID;
    string public date;


    // Deployment parameters and course info

    constructor(string memory Id, string memory at_date) {
        instructor = msg.sender;
        courseID = Id;
        date = at_date;
    }

    modifier instructorOnly() {
        require(msg.sender == instructor, "Permission denied! Only the instructor can use this function.");
        _;
    } 

    bool public attendance_active = false;

    // Enable or disable attendance

    function enable() public instructorOnly returns(string memory) {
        if(attendance_active == true){
            return "Attendance is already enabled!";
        } else {
            attendance_active = true;
            return "Attendance has been enabled";
        }
    }

    function disable() public instructorOnly returns(string memory) {
        if(attendance_active == false){
            return "Attendance is already disabled!";
        } else {
            attendance_active = false;
            return "Attendance has been disabled";
        }
    }


    // taking attendance

   struct Student {
       address studentAddress;
       uint studentId;
   }

   Student[] public attendees;

    function giveAttendance(uint studentID) public {
        require(attendance_active == true, "Attendance is not active at the moment.");
        for(uint i = 0; i< attendees.length; i++) {
            if(attendees[i].studentAddress == msg.sender) {
                revert("Attendance already given.");
            }
        }
        attendees.push(Student(msg.sender, studentID));
    }

    // checking attendance

    function checkAttendance() public view returns(uint) {
        for(uint i=0;i<attendees.length;i++) {
            if(attendees[i].studentAddress==msg.sender) {
                return attendees[i].studentId;
            }
        }
        revert("Attendance not given.");
    }

    // checking attendance by instructor
    function checkAttendanceInstructor(uint studentID) public instructorOnly view returns(bool) {
        for(uint i = 0; i< attendees.length; i++) {
            if(attendees[i].studentId == studentID) {
                return true;
            }
        }
        return false;
    }

    // Counting attendance

    function attendanceCount() public view returns(uint) {
        uint count = 0;
        for(uint i = 0; i< attendees.length; i++) {
            count++;
        }
        return count;
    }



    
    



    
}

