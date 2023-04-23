export class ErrorModal{
    private static errorModalInstance: any;
    public static show(message: string){
        if(ErrorModal.errorModalInstance) ErrorModal.errorModalInstance.showErrorMessage(message);
    }

    public static initialize(modalRef: any){
        ErrorModal.errorModalInstance = modalRef;
    }
}