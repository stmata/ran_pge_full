import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'
import useSignIn from 'react-auth-kit/hooks/useSignIn';


export default function AreaModalLogin({ setOpen, open, email }) {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL 
    const { setUserID } = useUser();
    const signIn = useSignIn();
    const navigate = useNavigate();
    const [errorCode, setErrorCode] = useState('');
    const [code, setCode] = useState('');
    const handleClose = () => {
        setOpen(false);
    };
    const handleChange = (event) => {
        setCode(event.target.value);
      };

    const goToDashbord = async () => {
        try{
            const response = await fetch(`${baseUrl}/verify_code`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email,
                  code,
                }),
            });
            const data = await response.json()
            if (response.status){
                
                const accessToken = (data.accessToken);
                const accessTokenExpiresAt = new Date(data.accessTokenExpiresAt);
                const refreshToken = (data.refreshToken);
                const id = data._id;
                setUserID(id)
                
                signIn({
                    auth : {
                        token : accessToken,
                        type: 'Bearer',
                        expiresAt: accessTokenExpiresAt,
                    },
                    userState: {email : email},
                    refresh : refreshToken
                });
                navigate("/Dashboard")
                setOpen(false);
            }
            else{
                setErrorCode('The code verification failed');
            }
            
        } catch (error) {
        console.error('Error: The code verification failed');
        setErrorCode('The code verification failed');
        }
    };
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        
        <DialogContent>
          <DialogContentText>
          Please enter the code received by email.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label=""
            type=""
            fullWidth
            variant="standard"
            value={code}
            onChange={handleChange}
          />
          <center><h6 style={{color:"red", fontSize:"0.8rem"}}>{errorCode}</h6></center>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={goToDashbord}>Verify code</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
