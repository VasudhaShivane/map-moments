import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Card from '../../shared/components/UIElements/Card';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './NewPlace.css';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [imagePreview, setImagePreview] = useState(null);
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
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

  const history = useHistory();

  const imageInputHandler = (id, file, isValid) => {
    // Generate preview URL when image is selected
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImagePreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    // Forward to form input handler
    inputHandler(id, file, isValid);
  };

  const placeSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('creator', auth.userId);
      formData.append('image', formState.inputs.image.value);

      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + '/places',
        'POST',
        formData,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      history.push('/');
    } catch (err) {}
  };

  // Cancel form submission
  const cancelSubmitHandler = () => {
    history.push('/');
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="place-form-card">
        <form className="place-form" onSubmit={placeSubmitHandler}>
          {isLoading && <LoadingSpinner asOverlay />}
          
          
          <div className="form-row">
            <Input
              id="title"
              element="input"
              type="text"
              label="Title"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid title."
              onInput={inputHandler}
              placeholder="Enter an attractive title"
            />
          </div>
          
          <div className="form-row">
            <Input
              id="description"
              element="textarea"
              label="Description"
              validators={[VALIDATOR_MINLENGTH(5)]}
              errorText="Please enter a valid description (at least 5 characters)."
              onInput={inputHandler}
              placeholder="Describe this place"
              rows={4}
            />
          </div>
          
          <div className="form-row">
            <Input
              id="address"
              element="input"
              label="Address"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid address."
              onInput={inputHandler}
              placeholder="Enter the location address"
            />
          </div>

          <div className="form-row">
            <div className="image-upload-container">
             
              <ImageUpload 
                id="image"
                onInput={imageInputHandler}
                errorText="Please provide an image"
                previewUrl={imagePreview}
                center
              />
              {imagePreview && (
                <div className="image-preview-info">
                  <p>Image selected! Preview shown above.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <Button type="button" inverse onClick={cancelSubmitHandler}>
              CANCEL
            </Button>
            <Button type="submit" disabled={!formState.isValid}>
              ADD PLACE
            </Button>
          </div>
        </form>
      </Card>
    </React.Fragment>
  );
};

export default NewPlace;