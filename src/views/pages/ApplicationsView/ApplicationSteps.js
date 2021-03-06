import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import { useSnackbar } from 'notistack';

import axios from 'src/utils/axios';

import { Button, Typography, MenuItem } from '@material-ui/core';
import {
  ValidatorForm,
  TextValidator,
  SelectValidator
} from 'react-material-ui-form-validator';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  },
  textField: {
    marginBottom: '16px'
  }
}));

function getSteps() {
  return [
    'Profile Information',
    'Education Information',
    'Application Challenge'
  ];
}

function getStepContent(
  step,
  setActiveStep,
  formData,
  setFormData,
  baseUrl,
  applicationId
) {
  switch (step) {
    case 0:
      return (
        <FormPersonalInfo
          setActiveStep={setActiveStep}
          data={formData}
          setData={setFormData}
          baseUrl={baseUrl}
          applicationId={applicationId}
        />
      );
    case 1:
      return (
        <FormEducationInfo
          setActiveStep={setActiveStep}
          data={formData}
          setData={setFormData}
          baseUrl={baseUrl}
          applicationId={applicationId}
        />
      );
    case 2:
      return (
        <FormChallenge
          setActiveStep={setActiveStep}
          data={formData}
          setData={setFormData}
          baseUrl={baseUrl}
          applicationId={applicationId}
        />
      );
    default:
      return 'Unknown step';
  }
}

export function ApplicationSteps({ applicationId, setCourseTitle }) {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const baseUrl =
    'https://us-central1-codeforcauseorg.cloudfunctions.net/widgets/applications/request';
  const [activeStep, setActiveStep] = React.useState(-1);
  const [formData, setFormData] = React.useState({
    personal: {},
    education: {},
    challenge: {}
  });
  const steps = getSteps();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmitApplication = () => {
    const url = `${baseUrl}/${applicationId}/submit`;

    formData.submitted = true;

    axios({
      method: 'put',
      url: url,
      data: formData
    })
      .then(response => {
        enqueueSnackbar('Application Completed Successfully.');
      })
      .catch(e => {
        enqueueSnackbar('Failed with error. Try again later.');
      });
    setActiveStep(4);
  };

  const getApplication = useCallback(() => {
    axios
      .get(`${baseUrl}/${applicationId}`)
      .then(response => {
        setCourseTitle(response.data.batch.courseName);

        if (isMountedRef.current) {
          if (response.data.submitted) {
            setActiveStep(4);
            enqueueSnackbar(
              'You application in submitted. We will contact you back with result.'
            );
          } else {
            setFormData(response.data);
            setActiveStep(0);
          }
        }
      })
      .catch(e => {
        console.log('Failed');
      });
  }, [isMountedRef, applicationId, enqueueSnackbar, setCourseTitle]);

  useEffect(() => {
    getApplication();
  }, [getApplication]);

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(
                index,
                setActiveStep,
                formData,
                setFormData,
                baseUrl,
                applicationId
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed</Typography>
          <Button onClick={handleSubmitApplication} className={classes.button}>
            Submit Application
          </Button>
        </Paper>
      )}
      {activeStep === steps.length + 1 && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>
            Application have been submitted successfully. We will email/call you
            for further process.
          </Typography>
        </Paper>
      )}
    </div>
  );
}

function FormPersonalInfo({
  setActiveStep,
  data,
  setData,
  baseUrl,
  applicationId
}) {
  const classes = useStyles();
  const [formData, updateFormData] = useState(data.personal);

  const handleChange = event => {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setData({
      ...data,
      personal: formData
    });

    const url = `${baseUrl}/${applicationId}/personal`;

    axios({
      method: 'put',
      url: url,
      data: formData
    })
      .then(response => {})
      .catch(e => {});
    setActiveStep(1);
  };

  return (
    <ValidatorForm onSubmit={handleSubmit}>
      <TextValidator
        key="name"
        className={classes.textField}
        label="Name"
        variant="outlined"
        value={formData.name}
        fullWidth
        name="name"
        onChange={handleChange}
        validators={['required']}
        errorMessages={['Name is a required field']}
      />

      <TextValidator
        key="phone"
        className={classes.textField}
        label="Phone"
        variant="outlined"
        value={formData.phone}
        fullWidth
        name="phone"
        onChange={handleChange}
        validators={['required']}
        errorMessages={['Phone number is a required field']}
      />

      <TextValidator
        key="email"
        className={classes.textField}
        label="Email"
        variant="outlined"
        value={formData.email}
        fullWidth
        name="email"
        onChange={handleChange}
        validators={['required', 'isEmail']}
        errorMessages={[
          'Email is a required field',
          'Must be a valid Email address'
        ]}
      />

      <SelectValidator
        key="gender"
        className={classes.textField}
        value={formData.gender}
        onChange={handleChange}
        name="gender"
        variant="outlined"
        validators={['required']}
        errorMessages={['Please select a gender']}
        label="Gender"
        fullWidth
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </SelectValidator>

      <Button variant="outlined" disabled color="secondary">
        Cancel
      </Button>

      <Button
        type="submit"
        variant="contained"
        color="secondary"
        style={{
          marginLeft: '16px'
        }}
      >
        Save
      </Button>
    </ValidatorForm>
  );
}

function FormEducationInfo({
  setActiveStep,
  data,
  setData,
  baseUrl,
  applicationId
}) {
  const classes = useStyles();
  const [formData, updateFormData] = useState(data.education);

  const handleChange = event => {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handlePrev = () => {
    setActiveStep(0);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setData({
      ...data,
      education: formData
    });

    const url = `${baseUrl}/${applicationId}/education`;

    axios({
      method: 'put',
      url: url,
      data: formData
    })
      .then(response => {})
      .catch(e => {});
    setActiveStep(2);
  };

  const years = Array(25)
    .fill(2000)
    .map((x, y) => x + y);

  return (
    <ValidatorForm onSubmit={handleSubmit}>
      <SelectValidator
        key="year"
        className={classes.textField}
        value={formData.year}
        onChange={handleChange}
        name="year"
        variant="outlined"
        validators={['required']}
        errorMessages={['Please select your Graduation Year']}
        label="Graduation Year"
        fullWidth
      >
        {years.map((year, index) => {
          return <MenuItem value={year}>{year}</MenuItem>;
        })}
      </SelectValidator>

      <TextValidator
        key="college"
        className={classes.textField}
        label="College"
        variant="outlined"
        value={formData.college}
        fullWidth
        name="college"
        onChange={handleChange}
        validators={['required']}
        errorMessages={['College is a required field']}
      />

      <TextValidator
        key="state"
        className={classes.textField}
        label="State"
        variant="outlined"
        value={formData.state}
        fullWidth
        name="state"
        onChange={handleChange}
        validators={['required']}
        errorMessages={['State is a required field']}
      />

      <TextValidator
        key="country"
        className={classes.textField}
        label="Country"
        variant="outlined"
        value={formData.country}
        fullWidth
        name="country"
        onChange={handleChange}
        validators={['required']}
        errorMessages={['Country is a required field']}
      />

      <Button variant="outlined" onClick={handlePrev} color="secondary">
        Prev
      </Button>
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        style={{
          marginLeft: '16px'
        }}
      >
        Save
      </Button>
    </ValidatorForm>
  );
}

function FormChallenge({
  setActiveStep,
  data,
  setData,
  baseUrl,
  applicationId
}) {
  const classes = useStyles();
  const [formData, updateFormData] = useState(data.challenge);
  const MIN_CHAR = 150;

  const handleChange = event => {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handlePrev = () => {
    setActiveStep(1);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setData({
      ...data,
      challenge: formData
    });

    const url = `${baseUrl}/${applicationId}/challenge`;

    axios({
      method: 'put',
      url: url,
      data: formData
    })
      .then(response => {})
      .catch(e => {});
    setActiveStep(3);
  };

  const countChar = string => string.replace(/\s/g, '').length;

  useEffect(() => {
    ValidatorForm.addValidationRule('isNotShort', value => {
      if (countChar(value) < MIN_CHAR) {
        return false;
      }
      return true;
    });
  });

  return (
    <ValidatorForm onSubmit={handleSubmit}>
      <TextValidator
        className={classes.textField}
        multiline
        fullWidth
        label="Why do you wish to take up this course?"
        variant="outlined"
        onChange={handleChange}
        name="q1"
        value={formData.q1}
        rows={4}
        validators={['required', 'isNotShort']}
        errorMessages={[
          'This is a required field',
          `Text too short.
            ${
              formData.q1 && formData.q1.length
                ? 'Put in ' +
                  (MIN_CHAR - countChar(formData.q1)) +
                  `${
                    countChar(formData.q1) < MIN_CHAR - 1
                      ? ' characters more'
                      : ' character more'
                  }`
                : `Put in ${MIN_CHAR} characters more`
            }`
        ]}
      />

      <TextValidator
        className={classes.textField}
        multiline
        fullWidth
        label="Why do you deserve this scholarship?"
        variant="outlined"
        onChange={handleChange}
        name="q2"
        value={formData.q2}
        rows={4}
        validators={['required', 'isNotShort']}
        errorMessages={[
          'This is a required field',
          `Text too short.
            ${
              formData.q2 && formData.q2.length
                ? 'Put in ' +
                  (MIN_CHAR - countChar(formData.q2)) +
                  `${
                    countChar(formData.q2) < MIN_CHAR - 1
                      ? ' characters more'
                      : ' character more'
                  }`
                : `Put in ${MIN_CHAR} characters more`
            }`
        ]}
      />

      <TextValidator
        className={classes.textField}
        multiline
        fullWidth
        label="What is your viewpoint towards Coding for a Cause?"
        variant="outlined"
        onChange={handleChange}
        name="q3"
        value={formData.q3}
        rows={4}
        validators={['required', 'isNotShort']}
        errorMessages={[
          'This is a required field',
          `Text too short.
            ${
              formData.q3 && formData.q3.length
                ? 'Put in ' +
                  (MIN_CHAR - countChar(formData.q3)) +
                  `${
                    countChar(formData.q3) < MIN_CHAR - 1
                      ? ' characters more'
                      : ' character more'
                  }`
                : `Put in ${MIN_CHAR} characters more`
            }`
        ]}
      />

      <Button variant="outlined" onClick={handlePrev} color="secondary">
        Prev
      </Button>
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        style={{
          marginLeft: '16px'
        }}
      >
        Save
      </Button>
    </ValidatorForm>
  );
}
