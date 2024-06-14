<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'
import { ArticleCategoryListService, ArticleCategoryAddService, ArticleCategoryUpdateService, ArticleCategoryDeleteService } from '@/api/article.js'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const categorys = ref([])
const ArticleCategoryList = async () => {
    const result = await ArticleCategoryListService();
    categorys.value = result.data;
}



const dialogVisible = ref(false)


const categoryModel = ref({
    category_name: '',
    category_alias: ''
})

const rules = {
    category_name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
    ],
    category_alias: [
        { required: true, message: '请输入分类别名', trigger: 'blur' },
    ]
}

const addCategory = async () => {
    const result = await ArticleCategoryAddService(categoryModel.value)
    ElMessage.success(result.msg ? result.msg : '添加成功')
    ArticleCategoryList()
    dialogVisible.value = false
}
const title = ref('')

const showDialog = (row) => {
    dialogVisible.value = true
    title.value = '编辑分类'
    categoryModel.value.category_name = row.category_name
    categoryModel.value.category_alias = row.category_alias
    categoryModel.value.id = row.id
}

const updateCategory = async () => {
    const result = await ArticleCategoryUpdateService(categoryModel.value);
    ElMessage.success(result.msg ? result.msg : '修改成功')
    ArticleCategoryList();
    dialogVisible.value = false;
}

const clearData = () => {
    categoryModel.value.category_name = ''
    categoryModel.value.category_alias = ''
}

const deleteCategory = (row) => {
    ElMessageBox.confirm(
        '你确认删除该分类信息吗？',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async() => {
            let result = await ArticleCategoryDeleteService(row.id)
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            ArticleCategoryList()
        })
        .catch(() => {

            ElMessage({
                type: 'info',
                message: '取消删除',
            })
        })
}
ArticleCategoryList();


</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>文章分类</span>
                <div class="extra">
                    <el-button type="primary" @click="dialogVisible = true; title = '添加分类'; clearData()">添加分类</el-button>
                </div>
            </div>
        </template>
        <el-table :data="categorys" style="width: 100%">
            <el-table-column label="序号" width="100" type="index"> </el-table-column>
            <el-table-column label="分类名称" prop="category_name"></el-table-column>
            <el-table-column label="分类别名" prop="category_alias"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" @click="showDialog(row)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteCategory(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>

        <el-dialog v-model="dialogVisible" :title="title" width="30%">
            <el-form :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
                <el-form-item label="分类名称" prop="category_name">
                    <el-input v-model="categoryModel.category_name" minlength="1" maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="分类别名" prop="category_alias">
                    <el-input v-model="categoryModel.category_alias" minlength="1" maxlength="15"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="title == '添加分类' ? addCategory() : updateCategory()"> 确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>