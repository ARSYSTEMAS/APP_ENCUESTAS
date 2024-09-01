import { h } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import Msg from '../components/toastify/MsgEncuesta.vue';
export default async function notify(msg) {

    const id = toast.loading(
        'Verificando, por favor espere...',
        {
            position: toast.POSITION.BOTTOM_RIGHT,
            theme:'dark'
        },
    );

    setTimeout(() => {
        toast.update(id, {
            render: () => h(Msg, { 
                message:msg
            }),
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'error',
            isLoading: false,
        });

        setTimeout(() => {
            // done
            toast.done(id);
        }, 1000);
    }, 2000);

}