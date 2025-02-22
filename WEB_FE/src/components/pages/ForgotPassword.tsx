import React, { Fragment, useState } from "react";
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
import { addFlag } from "@/redux/features/contextSlice";

import AuthApi from "@/api/authApi";
import { setUser } from "@/redux/features/contextSlice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await AuthApi.changePassword({
        email: data.email,
      });

      setIsSubmitting(false);
      const errors = {
        email: undefined,
        password: undefined,
      };
      dispatch(
        addFlag({
          color: "success",
          content: `Email was sent to ${data.email} !`,
        })
      );
      // setTimeout(() => {
      //   navigate("/auth/sign-in");
      // }, 1000);
      return errors;
    } catch (err) {
      setIsSubmitting(false);
      console.log("err", err);
      const errors = {
        email: "Email is incorrect!",
        password: undefined,
      };
      dispatch(
        addFlag({
          color: "error",
          content: "Fail to send email!",
        })
      );
      return errors;
    }
  };

  const handleCancel = () => {
    navigate("/auth/sign-in");
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
            <FormHeader title="Forgot Password"></FormHeader>
            <FormSection>
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
            </FormSection>

            <FormFooter>
              <ButtonGroup>
                <Button appearance="subtle" onClick={handleCancel}>
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={isSubmitting}
                >
                  Submit
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
        )}
      </Form>

      <div className="mt-10 flex flex-col items-center">
        <span>Not have an account yet?</span>
        <LinkButton appearance="link" href="/auth/sign-up">
          Sign Up
        </LinkButton>
      </div>
    </div>
  );
};

export default ForgotPassword;
