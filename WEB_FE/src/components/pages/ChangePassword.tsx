import React, { Fragment, useEffect, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { LinkButton } from "@atlaskit/button/new";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthApi from "@/api/authApi";
import { setUser } from "@/redux/features/contextSlice";
import UserApi from "@/api/userApi";

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const user = useAppSelector((state) => state.context.user);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWrongCode, setIsWrongCode] = useState(true);

  const initData = async () => {
    try {
      setIsLoading(true);
      const verifyCode = searchParams.get("verifyCode");
      const userId = searchParams.get("userId");

      if (userId && verifyCode) {
        const user = await UserApi.getUserById(userId);
        if (verifyCode === user.verifyCode) {
          setIsWrongCode(false);
        } else {
          setIsWrongCode(true);
        }
        dispatch(setUser(user));
      }
      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
      setIsWrongCode(true);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSubmit = async (data) => {
    if (data.password1.trim() === "") {
      const errors = {
        password1: "Password must be a valid string!",
        password2: undefined,
      };

      return errors;
    }
    if (data.password2.trim() === "") {
      const errors = {
        password1: undefined,
        password2: "Please confirm your password!",
      };

      return errors;
    }
    if (data.password1.trim() !== data.password2.trim()) {
      const errors = {
        password1: undefined,
        password2: "Please re enter your password!",
      };

      return errors;
    }

    const res = await UserApi.updateUser({
      email: user?.email,
      password: data.password1.trim(),
    });
    console.log(res);

    if (res) {
      // navigate("/");
      window.location.href = "/auth/sign-in";

      const errors = {
        password1: undefined,
        password2: undefined,
      };

      return errors;
    } else {
      const errors = {
        password1: undefined,
        password2: undefined,
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
      {isLoading ? (
        <div>Loading</div>
      ) : (
        <>
          {!isWrongCode ? (
            <Form<{ email: string; password: string; remember: boolean }>
              onSubmit={handleSubmit}
            >
              {({ formProps, submitting }) => (
                <form {...formProps}>
                  <FormHeader title="Change Password">
                    <p aria-hidden="true">{user?.email}</p>
                    <p aria-hidden="true">
                      Required fields are marked with an asterisk{" "}
                      <RequiredAsterisk />
                    </p>
                  </FormHeader>
                  <FormSection>
                    {/* <Field
                      name="email"
                      label="Email"
                      defaultValue={user?.email}
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField {...fieldProps} />
                          {!error && (
                            <HelperMessage>Must contain @ symbol</HelperMessage>
                          )}
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </Fragment>
                      )}
                    </Field> */}
                    <Field
                      aria-required={true}
                      name="password1"
                      label="New password"
                      defaultValue=""
                      isRequired
                    >
                      {({ fieldProps, error, valid, meta }) => {
                        return (
                          <Fragment>
                            <TextField type="password" {...fieldProps} />
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </Fragment>
                        );
                      }}
                    </Field>
                    <Field
                      aria-required={true}
                      name="password2"
                      label="Confirm your new password"
                      defaultValue=""
                      isRequired
                    >
                      {({ fieldProps, error, valid, meta }) => {
                        return (
                          <Fragment>
                            <TextField type="password" {...fieldProps} />
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                          </Fragment>
                        );
                      }}
                    </Field>
                  </FormSection>

                  <FormFooter>
                    <ButtonGroup>
                      {/* <Button appearance="subtle" onClick={handleCancel}>
                        Cancel
                      </Button> */}
                      <LoadingButton
                        type="submit"
                        appearance="primary"
                        isLoading={submitting}
                      >
                        Submit
                      </LoadingButton>
                    </ButtonGroup>
                  </FormFooter>
                </form>
              )}
            </Form>
          ) : (
            <div>Some thing went wrong!</div>
          )}
        </>
      )}

      <div className="mt-10 flex flex-col items-center">
        <span>Already have an account?</span>
        <LinkButton appearance="link" href="/auth/sign-in">
          Sign In
        </LinkButton>
      </div>
    </div>
  );
};

export default ChangePassword;
