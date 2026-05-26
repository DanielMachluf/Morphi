import { Notyf } from "notyf"; 

class Notify {

    private notyf = new Notyf({
        position: { x: "center", y: "top" },
        duration: 3000,
        dismissible: true,
        ripple: true 
    });

    public success(message: string): void {
        this.notyf.success(message);
    }

    public error(err: any): void {
        const message = this.extractErrorMessage(err);
        this.notyf.error(message);
    }

    private extractErrorMessage(err: any): string {
        if(typeof err === "string") return err; 
        if(typeof err?.response?.data === "string") return err.response.data; 
        if(typeof err?.response?.data?.message === "string") return err.response.data.message;
        if(typeof err?.message === "string") return err.message; 
        return "Some error, please try again.";
    }

}

export const notify = new Notify();
