import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Container } from "@mui/system";
import { Button, Grid, TextField } from "@mui/material";
import { ethers } from "ethers";
import { abi } from "./contractABI";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [address, setAddress] = useState("");
  const [active, setActive] = useState();
  const [instructor, setInstructor] = useState();
  const [studentID, setStudentID] = useState("");
  const [instructorcheck, setInstructorCheck] = useState("");

  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  useEffect(() => {
    const connectWallet = async () => {
      // MetaMask requires requesting permission to connect users accounts
      const addresses = await provider.send("eth_requestAccounts", []);
      setAddress(addresses[0]);
      console.log(`current address: ${address}`);
    };

    // const getBalance = async () => {
    //   const balance = await provider.getBalance(address);
    //   let formattedBalance = ethers.utils.formatEther(balance);
    //   console.log(formattedBalance);
    // };

    const openingStates = async () => {
      const status = await contract.attendance_active();
      setActive(status);
      const resultInstructor = await contract.instructor();
      console.log(`instructor: ${resultInstructor}`);
      setInstructor(resultInstructor.toLowerCase());
    };

    openingStates().catch(console.error);

    connectWallet().catch(console.error);
  });

  const toggleEnable = async (e) => {
    if (active) {
      const disabler = await contract.disable();
      await disabler.wait();
      console.log(disabler);
      console.log(`changed: ${await contract.attendance_active()}`);
    } else {
      const enabler = await contract.enable();
      await enabler.wait();
      console.log(enabler);
      console.log(`changed: ${await contract.attendance_active()}`);
    }
    setActive(!active);
  };

  const submitAttendance = async (e) => {
    e.preventDefault();
    const attendance = await contract.giveAttendance(studentID).catch((err) => {
      alert("Attendance already given");
      return 0;
    });
    await attendance.wait().catch(console.log("No waiting"));
    alert("Attendance submitted");
  };
  const attendanceCheck = async (e) => {
    e.preventDefault();
    const checking = await contract.checkAttendance().catch((err) => {
      alert("Attendance is not given.");
      return 0;
    });
    await checking.wait();
    alert(`Attendance given! ID ${checking.toString()}`);
  };

  const instructorChecking = async (e) => {
    e.preventDefault();
    const checking = await contract.checkAttendanceInstructor(instructorcheck);
    if (checking === true) {
      alert("The student attended the class.");
    } else {
      alert("The student hasn't attended the class.");
    }
  };

  const countAttendance = async (e) => {
    const counting = await contract.attendanceCount();
    console.log(counting);
    alert(`Number of student attended: ${counting}`);
  };

  return (
    <div>
      <Navbar />

      <Container maxWidth="md">
        <Grid container direction={"column"} spacing={5}>
          {address == instructor ? (
            <Grid item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={active} onChange={toggleEnable} />}
                  label="Attendance enabled"
                  sx={{ p: 3 }}
                />
              </FormGroup>
            </Grid>
          ) : null}
          <Grid item>
            {active ? (
              <TextField
                id="outlined-basic"
                label="Enter Student ID"
                variant="outlined"
                onChange={(e) => {
                  setStudentID(e.target.value);
                }}
              />
            ) : (
              <TextField
                id="outlined-basic"
                label="Attendance is not active!!"
                variant="outlined"
                disabled
              />
            )}
            <Button
              sx={{ mx: 2 }}
              onClick={submitAttendance}
              variant="contained"
              size="large"
            >
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              sx={{ maxWidth: "300px" }}
              variant="contained"
              onClick={attendanceCheck}
            >
              Check Attendance
            </Button>
          </Grid>
          <Grid item>
            {address === instructor ? (
              <div>
                <TextField
                  id="outlined-basic"
                  label="Enter Student ID"
                  variant="outlined"
                  onChange={(e) => {
                    setInstructorCheck(e.target.value);
                  }}
                />
                <Button
                  sx={{ mx: 2 }}
                  variant="contained"
                  size="large"
                  onClick={instructorChecking}
                >
                  Submit
                </Button>
              </div>
            ) : null}
          </Grid>
          <Grid item>
            <Button
              sx={{ maxWidth: "300px" }}
              variant="contained"
              onClick={countAttendance}
            >
              Attendance count
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
