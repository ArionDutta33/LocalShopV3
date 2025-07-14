export class ApiResponse<T> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
