<script setup>
import { ref } from 'vue'
import { resetPasswordService } from '@/api/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token.js'

const formRef = ref()
const pwdForm = ref({
    old_pwd: '',
    new_pwd: '',
    re_pwd: ''
})

const checkDifferent = (rule, value, callback) => {
    if (value === pwdForm.value.old_pwd) {
        callback(new Error('新密码不能与原密码一样'))
    } else {
        callback()
    }
}
const checkSameAsNewPwd = (rule, value, callback) => {
    if (value !== pwdForm.value.new_pwd) {
        callback(new Error('确认密码必须和新密码一样'))
    } else {
        callback()
    }
}
const rules = ref({
    old_pwd: [
        { required: true, message: '请输入原密码', trigger: 'blur' },
        { min: 5, max: 16, message: '原密码长度在6-15位之间', trigger: 'blur' }
    ],
    new_pwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 5, max: 16, message: '新密码长度在6-15位之间', trigger: 'blur' },
        { validator: checkDifferent, trigger: 'blur' }
    ],
    re_pwd: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { min: 5, max: 16, message: '确认密码长度在6-15位之间', trigger: 'blur' },
        { validator: checkSameAsNewPwd, trigger: 'blur' }
    ]
})

const tokenStore = useTokenStore();
const router = useRouter()

const submitForm = async () => {
    await formRef.value.validate()

    // 获取用户的 Token
    const token = tokenStore.token

    // 在请求头中添加 Token
    await resetPasswordService({ ...pwdForm.value, token })

    ElMessage.success('密码修改成功')

    // 密码修改成功后，退出重新登录
    // 清空本地存储的 token 
    tokenStore.setToken('')
    // 拦截登录
    router.push('/login')
}

const resetForm = () => {
    formRef.value.resetFields()
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>基本资料</span>
            </div>
        </template>
            <el-row justify="center">
                <el-col :span="12">
                    <el-form ref="formRef" :model="pwdForm" :rules="rules" label-width="100px" class="custom-form">
                        <el-form-item label="原密码" prop="old_pwd">
                            <el-input v-model="pwdForm.old_pwd" show-password ></el-input>
                        </el-form-item>
                        <el-form-item label="新密码" prop="new_pwd">
                            <el-input v-model="pwdForm.new_pwd" show-password ></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="re_pwd">
                            <el-input v-model="pwdForm.re_pwd" show-password ></el-input>
                        </el-form-item>
                        <el-form-item class="button-container">
                            <el-button type="primary" @click="submitForm">修改密码</el-button>
                            <el-button @click="resetForm">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
    </el-card>

</template>
