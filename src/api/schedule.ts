import { Router } from "express";
import logger from "../logger";
import prisma from "../prisma";
import grpcClient from "../proto/classroomsClient";
import { Entry, getEntriesWitinSpan } from "../utils/entries";

const router = Router();

/**
 * @openapi
 * "/api/schedule/{tenantId}":
 *   post:
 *     summary: Get user schedule
 *     tags: [Schedule]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 format: date
 *               to:
 *                 type: string
 *                 format: date
 *             required: [from, to]
 *     responses:
 *       200:
 *         description: "Schedule entries"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   classroomId:
 *                     type: string
 *                   classroomName:
 *                     type: string
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *       "400":
 *         $ref: "#/components/responses/MissingParameters"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/:tenantId", async (req, res) => {
  // Shouldn't happen (user should be authenticated)
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { from, to } = req.body;
  if (!from || !to) {
    logger.debug(
      { request: { path: req.originalUrl, method: req.method, params: req.params, body: req.body }, user: req.user },
      "Missing required parameters"
    );
    res.status(400).json({ message: "From and to are required" });
    return;
  }

  let fromDate: Date;
  let toDate: Date;

  try {
    fromDate = new Date(from);
    toDate = new Date(to);
  } catch (err) {
    logger.debug(
      {
        request: { path: req.originalUrl, method: req.method, params: req.params, body: req.body },
        user: req.user,
        error: err,
      },
      "Invalid date format"
    );
    res.status(400).json({ message: "Invalid date format", error: err });
    return;
  }

  const { tenantId } = req.params;

  grpcClient.GetUserClassrooms({ tenantId, userId: req.user.id }, async (err, response) => {
    if (err) {
      logger.error(
        { request: { path: req.originalUrl, params: req.params, method: req.method }, user: req.user, error: err },
        "Fetching user classrooms failed"
      );
      res.status(500).json({ message: "Fetching user classrooms failed", error: err });
    } else {
      logger.debug(
        { request: { path: req.originalUrl, params: req.params, method: req.method }, user: req.user },
        "User classrooms fetched"
      );

      if (!response || response?.classrooms.length === 0) {
        logger.debug(
          { request: { path: req.originalUrl, params: req.params, method: req.method }, user: req.user },
          "User not in any classroom"
        );
        res.status(200).json([]);
        return;
      }

      const entries = await prisma.scheduleEntry.findMany({
        where: {
          classroom: {
            in: response.classrooms.map((classroom) => classroom.classroomId),
          },
          tenantId: tenantId,
          OR: [{ repeatEnd: null }, { repeatEnd: { gte: fromDate } }],
        },
      });

      let scheduleEntries: Entry[] = [];

      for (let entry of entries) {
        scheduleEntries = scheduleEntries.concat(getEntriesWitinSpan(entry, fromDate, toDate));
      }

      for (let entry of scheduleEntries) {
        const classroom = response.classrooms.find((classroom) => classroom.classroomId === entry.classroomId);
        entry.classroomName = classroom?.name;
      }

      logger.info(
        { request: { path: req.originalUrl, params: req.params, method: req.method }, user: req.user },
        "Schedule entries fetched"
      );
      res.status(200).json(scheduleEntries);
    }
  });
});

export default router;
