export type ActionResult<T = undefined> =
  | {
      success: true;
      data: T;
      error?: never;
      fieldErrors?: never;
    }
  | {
      success: false;
      data?: never;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
