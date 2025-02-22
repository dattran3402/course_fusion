import React from "react";
import Button from "@atlaskit/button/standard-button";
import Spinner from "@atlaskit/spinner";

const LoadingButton = ({
  appearance,
  onClick,
  type,
  isLoading,
  isDisabled = false,
  content,
}) => {
  return (
    <Button
      appearance={appearance ? appearance : "default"}
      onClick={onClick}
      type={type}
      iconAfter={isLoading ? <Spinner /> : <></>}
      isDisabled={isDisabled || isLoading}
    >
      {content}
    </Button>
  );
};

export default LoadingButton;
