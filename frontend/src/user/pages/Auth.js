import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false
          },
          image: {
            value: null,
            isValid: false
          }
        },
        false
      );
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  const authSubmitHandler = async event => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL +'/users/login',
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        );
        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    } else {
      try {
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users/signup',
          'POST',
          formData
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <div className="auth-container">
        <div className="auth-image">
          {isLoginMode ? (
            <img 
              src="/images/login_bg.png"
              alt="Login" 
              className="auth-image__img"
            />
          ) : (
            <img 
              src="/images/siggnn.png"
              alt="Sign up" 
              className="auth-image__img"
            />
          )}
        </div>
        <Card className="authentication">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="authentication__header">
            <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
          </div>
          
          <form onSubmit={authSubmitHandler}>
            {!isLoginMode && (
              <Input
                element="input"
                id="name"
                type="text"
                label="Full Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter your name."
                onInput={inputHandler}
                placeholder="John Doe"
              />
            )}
            
            <Input
              element="input"
              id="email"
              type="email"
              label="Email Address"
              validators={[VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email address."
              onInput={inputHandler}
              placeholder="example@domain.com"
            />
            <Input
              element="input"
              id="password"
              type="password"
              label="Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Password must be at least 6 characters."
              onInput={inputHandler}
              placeholder="••••••••"
            />
            
            {!isLoginMode && (
              <div className="image-upload-compact">
                <ImageUpload 
                  id="image" 
                  onInput={inputHandler}
                />
              </div>
            )}
            
            <Button type="submit" disabled={!formState.isValid}>
              {isLoginMode ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </Button>
          </form>
          
          <div className="auth-switch">
            <Button inverse onClick={switchModeHandler}>
              {isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Log in'}
            </Button>
          </div>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default Auth;