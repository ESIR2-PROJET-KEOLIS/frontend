<template>
    <input type="checkbox" id="my-modal-error" class="modal-toggle" />
    <div class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
            <h3 class="font-bold text-lg">An error occurred!</h3>
            <p class="py-4"> {{ errormsg }}</p>
            <div class="modal-action">
                <label @click="refresh" class="btn">Refresh Page</label>
                <label for="my-modal-error" class="btn">Close</label>
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
        }
    },
    methods: {
        showErrorMessage(message){
            this.errormsg = message;
            document.getElementById('my-modal-error').checked = true;
        },
        refresh(){
            window.location.reload();
        }
    }
}
</script>

<style scoped>

</style>