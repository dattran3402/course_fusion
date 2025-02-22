import axiosInstance from "./axiosInstance";

const pay = async ({
  courseId,
  userId,
  successUrl,
  cancelUrl,
}: {
  courseId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const res = await axiosInstance.post(`/payment/course`, {
    courseId,
    userId,
    successUrl,
    cancelUrl,
  });
  return res.data.data;
};

const PaymentApi = {
  pay,
};

export default PaymentApi;
