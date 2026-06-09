import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import userRoutes from "./routes/user.routes.js";
import teamRoutes from "./routes/team.routes.js";
import taskRoutes from "./routes/task.routes.js";
import uploadRoutes from "./routes/upload.routes.js"
import submissionRoutes from "./routes/submission.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js";
import dailyReportRoutes from "./routes/dailyReport.routes.js";
import activityRoutes from "./routes/activity.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/",(req,res)=>
{
    res.json({
        success:true,
        message: "Safarian CRM is running"
    })
})

app.use("/api/auth",authRoutes);
app.use("/api/test",testRoutes);
app.use("/api/users",userRoutes);
app.use("/api/teams",teamRoutes);
app.use("/api/tasks",taskRoutes)
app.use("/api/uploads",uploadRoutes);
app.use("/api/submissions",submissionRoutes)
app.use("/api/attendance",attendanceRoutes)
app.use("/api/notifications",notificationRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/reports",dailyReportRoutes);
app.use("/api/activities",activityRoutes);
export default app;
