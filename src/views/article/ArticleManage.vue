<script setup>
import { Delete, Edit, Plus, Document } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ref } from 'vue'
import {
    ArticleAddService,
    ArticleCategoryListService,
    ArticleDeleteService,
    ArticleListService,
    ArticleUpdateService
} from "@/api/article";
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";

const categories = ref([])
const dialogContent = ref('')
const category_id = ref('')
const dialogVisible = ref(false)
const state = ref('')
const title = ref('')
const articles = ref([])


const pageNum = ref(1)
const total = ref(20)
const pageSize = ref(3)

const onSizeChange = (size) => {
    pageSize.value = size
    articleList()
}
const onCurrentChange = (num) => {
    pageNum.value = num
    articleList()
}

const articleCategoryList = async () => {
    const result = await ArticleCategoryListService();
    categories.value = result.data
}
articleCategoryList()

const articleList = async () => {
    const params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,

        category_id: category_id.value ? category_id.value : null,
        state: state.value ? state.value : null
    }
    const result = await ArticleListService(params);
    articles.value = result.data.items
    total.value = result.data.total
    for (let i = 0; i < articles.value.length; i++) {
        const article = articles.value[i];
        for (let j = 0; j < categories.value.length; j++) {
            if (article.category_id === categories.value[j].id) {
                article.category_name = categories.value[j].category_name
            }
        }
    }
}
articleList()


const visibleDrawer = ref(false)
const drawerTitle = ref('')

const articleModel = ref({
    id: '',
    title: '',
    category_id: '',
    cover_img: '',
    content: '',
    state: ''
})

const tokenStore = useTokenStore();
const uploadSuccess = (result) => {
    articleModel.value.cover_img = result.data
}

const addArticle = async (clickState) => {
    articleModel.value.state = clickState
    await ArticleAddService(articleModel.value);
    ElMessage.success('添加成功')
    visibleDrawer.value = false
    await articleList()
}


const showEditDialog = (row, title) => {
    visibleDrawer.value = true
    drawerTitle.value = title
    articleModel.value = {
        ...row
    }
    console.log({...row});
}

const showAddDialog = (title) => {
    clearData()
    drawerTitle.value = title
    visibleDrawer.value = true
}
const clearData = () => {
    articleModel.value = {
        id: '',
        title: '',
        category_id: '',
        cover_img: '',
        content: '',
        state: ''
    }
}

const updateArticle = async (clickState) => {
    try {
        articleModel.value.state = clickState;
        await ArticleUpdateService(articleModel.value);
        ElMessage.success("更新成功");
        visibleDrawer.value = false;
        await articleList();
    } catch (error) {
        console.error("更新文章失败：", error);
        ElMessage.error("更新文章失败，请稍后重试");
    }

    console.log(articleModel.value.content);
}


const deleteArticle = (row) => {
    ElMessageBox.confirm(
        '你确认要删除该文章信息吗？',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(
        async () => {
            await ArticleDeleteService(row.id)
            ElMessage.success("删除成功")
            await articleList()
        }
    )
}

const showDialog = (row) => {
    articleModel.value = { ...row }
  dialogVisible.value = true
  title.value = '查看文章'
}






</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>文章管理</span>
                <div class="extra">
                    <el-button type="primary" @click="showAddDialog('添加文章')">添加文章</el-button>
                </div>
            </div>
        </template>
        <!-- 搜索表单 -->
        <el-form inline>
            <el-form-item label="文章分类：">
                <el-select placeholder="请选择" v-mode="category_id">
                    <el-option v-for="c in categories" :key="c.id" :label="c.category_name" :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="发布状态：">
                <el-select placeholder="请选择" v-model="state">
                    <el-option label="已发布" value="已发布"></el-option>
                    <el-option label="草稿" value="草稿"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="articleList">搜索</el-button>
                <el-button @clic="category_id = ''; state = ''">重置</el-button>
            </el-form-item>
        </el-form>
        <!-- 文章列表 -->
        <el-table :data="articles" style="width: 100%">
            <el-table-column label="文章标题" width="400" prop="title"></el-table-column>
            <el-table-column label="分类" prop="category_name"></el-table-column>
            <el-table-column label="发表时间" prop="create_time">
                <template #default="scope">
                    {{ dayjs(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
            <el-table-column label="状态" prop="state"></el-table-column>
            <el-table-column label="操作" width="150">
                <template #default="{ row }">
                    <el-button :icon="Document" circle plain type="info" @click="showDialog(row)"></el-button>
                    <el-button :icon="Edit" circle plain type="primary"
                        @click="showEditDialog(row, '编辑文章')"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteArticle(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <!-- 分页条 -->
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />
    </el-card>


    <el-drawer v-model="visibleDrawer" :title="drawerTitle" direction="rtl" size="50%">
        <!-- 添加文章表单 -->
        <el-form :model="articleModel" label-width="100px">
            <el-form-item label="文章标题">
                <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item label="文章分类">
                <el-select placeholder="请选择" v-model="articleModel.category_id">
                    <el-option v-for="c in categories" :key="c.id" :label="c.category_name" :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="文章封面">

                <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                    name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
                    <el-image v-if="articleModel.cover_img" :src="articleModel.cover_img" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="文章内容">

                 <div class="editor">
                        <quill-editor theme="snow" v-model:content="articleModel.content" contentType="html"  >
                        </quill-editor>
                    </div>


            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="drawerTitle === '添加文章' ? addArticle('已发布') : updateArticle('已发布')">发布
                </el-button>
                <el-button type="info" @click="drawerTitle === '添加文章' ? addArticle('草稿') : updateArticle('草稿')">草稿
                </el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
    <el-dialog :title="title" v-model="dialogVisible" width="50%">
        <div class="article-content" v-html="articleModel.content"></div>
        <br /><br />
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">退 出</el-button>
        </span>
    </el-dialog>

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

.article-content {
  overflow-y: auto;
}


.avatar-uploader {
    :deep {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>