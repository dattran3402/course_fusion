import styled from "styled-components";

import Stars from "./Stars";

const GeneralReviewInfoStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .avg {
    font-weight: 500;
  }

  .total {
    font-size: 12px;
  }
`;

const GeneralReviewInfo = ({ course }) => {
  return (
    <GeneralReviewInfoStyles>
      <div className="avg">
        {course.totalReview === 0
          ? 0
          : (course.totalReviewStar || 0) / (course.totalReview || 1)}
      </div>
      <Stars
        rating={Math.floor(
          course.totalReview === 0
            ? 0
            : (course.totalReviewStar || 0) / (course.totalReview || 1)
        )}
      />
      <div className="total">{`(${course.totalReview} ratings)`}</div>
    </GeneralReviewInfoStyles>
  );
};

export default GeneralReviewInfo;
