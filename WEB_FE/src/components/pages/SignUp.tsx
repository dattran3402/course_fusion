import React, { Fragment } from "react";
import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button/standard-button";
import { Checkbox } from "@atlaskit/checkbox";
import TextField from "@atlaskit/textfield";
import Form, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  RequiredAsterisk,
} from "@atlaskit/form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/hook";
import { LinkButton } from "@atlaskit/button/new";
import Cookies from "js-cookie";

import AuthApi from "@/api/authApi";
import { setUser } from "@/redux/features/contextSlice";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (data) => {
    const res = await AuthApi.signUp({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (res) {
      if (data.remember) {
        Cookies.set("userId", res.id, { expires: 7 });
      }

      dispatch(setUser(res));

      // navigate("/");
      window.location.href = "/";

      const errors = {
        email: undefined,
        password: undefined,
        name: undefined,
      };

      return errors;
    } else {
      const errors = {
        email: "Email or password is incorrect!",
        password: undefined,
        name: undefined,
      };

      return errors;
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        width: "400px",
        maxWidth: "100%",
        margin: "0 auto",
        flexDirection: "column",
      }}
    >
      <Form<{ email: string; password: string; remember: boolean }>
        onSubmit={handleSubmit}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <FormHeader title="Sign Up">
              <p aria-hidden="true">
                Required fields are marked with an asterisk <RequiredAsterisk />
              </p>
            </FormHeader>
            <FormSection>
              <Field name="name" label="Name" defaultValue="" isRequired>
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField {...fieldProps} />
                  </Fragment>
                )}
              </Field>
              <Field name="email" label="Email" defaultValue="" isRequired>
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField {...fieldProps} />
                    {!error && (
                      <HelperMessage>Must contain @ symbol</HelperMessage>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </Fragment>
                )}
              </Field>
              <Field
                aria-required={true}
                name="password"
                label="Password"
                defaultValue=""
                isRequired
              >
                {({ fieldProps, error, valid, meta }) => {
                  return (
                    <Fragment>
                      <TextField type="password" {...fieldProps} />
                    </Fragment>
                  );
                }}
              </Field>
              <CheckboxField
                name="remember"
                label="Remember me"
                defaultIsChecked
              >
                {({ fieldProps }) => (
                  <Checkbox
                    {...fieldProps}
                    label="Always sign in on this device"
                  />
                )}
              </CheckboxField>
            </FormSection>

            <FormFooter>
              <ButtonGroup>
                <Button appearance="subtle" onClick={handleCancel}>
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={submitting}
                >
                  Sign up
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
        )}
      </Form>

      <div className="mt-10 flex flex-col items-center">
        <span>Already have an account?</span>
        <div className="flex items-center">
          <LinkButton appearance="link" href="/auth/sign-in">
            Sign In
          </LinkButton>
          <div>/</div>
          <LinkButton appearance="link" href="/auth/forgot-password">
            Forgot password
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
