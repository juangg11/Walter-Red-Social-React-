import { chatIdDto, createChatDto, createMessageDto } from '../dtos/chat.dto.js';
import { chatService } from '../services/chat.service.js';

export const chatController = {
  async searchUsers(req, res) {
    const data = await chatService.searchUsers(req.query.q, req.user.id);
    res.json(data);
  },

  async list(req, res) {
    const data = await chatService.list(req.user.id);
    res.json(data);
  },

  async create(req, res) {
    const data = await chatService.createOrGet(req.user.id, createChatDto(req.body).userId);
    res.status(201).json(data);
  },

  async messages(req, res) {
    const { chatId } = chatIdDto(req.params);
    const data = await chatService.messages(chatId, req.user.id);
    res.json(data);
  },

  async send(req, res) {
    const { chatId } = chatIdDto(req.params);
    const data = await chatService.send(chatId, req.user.id, createMessageDto(req.body));
    const recipients = await chatService.participantIds(chatId);
    req.app.get('broadcastChatMessage')?.(data, recipients);
    res.status(201).json(data);
  },
};
