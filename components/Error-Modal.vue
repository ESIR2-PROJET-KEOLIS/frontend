<template>
    <input type="checkbox" id="my-modal-error" class="modal-toggle" />
    <div class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
            <h3 class="font-bold text-lg">An error occurred!</h3>
            <p class="py-4"> {{ errormsg }}</p>
            <div class="modal-action">
                <label @click="refresh" class="btn">Refresh Page</label>
                <label for="my-modal-error" class="btn" @click="closeModal">Close</label>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Error-Modal",
    data() {
        return {
            errormsg : "",
            listError: []
        }
    },
    methods: {
        showErrorMessage(message){
            if(this.listError.length > 0){
                this.listError.push(message);
                return;
            }
            this.listError.push(message);
            this.setMessageAndOpenModal();
        },
        setMessageAndOpenModal(){
            if(this.listError.length === 0) return;
            this.errormsg = this.listError[0];
            document.getElementById('my-modal-error').checked = true;
        },
        closeModal(){
          let index = this.listError.indexOf(this.errormsg);
          this.listError.splice(index, 1);
          if(this.listError.length > 0){
              setTimeout(this.setMessageAndOpenModal, 250);
          }
        },
        refresh(){
            window.location.reload();
        }
    }
}
</script>

<style scoped>

</style>