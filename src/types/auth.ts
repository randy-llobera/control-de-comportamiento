export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = LoginInput & {
  displayName: string;
  schoolRole: string;
};
