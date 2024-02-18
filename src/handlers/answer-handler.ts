import { PartyPoolManager } from '../managers/party-pool-manager';
import { WebSocketManager } from '../managers/websocket-manager';
import { answerQuestionSchema, displayQuestionResultsSchema } from '../schemas/answer-schema';
import { AnswerQuestionMessage, DisplayQuestionResultsMessage } from '../types/answer-types';
import { Message } from '../types/party-types';
import { ExtWebSocket, WebSocketMessageEvent } from '../types/websocket-types';
import { sendMessage } from '../utils/send-message';

export namespace AnswerHandler {
    export async function displayQuestionResults(
        ws: ExtWebSocket,
        wsMessage: DisplayQuestionResultsMessage
    ) {
        try {
            const validation = displayQuestionResultsSchema.safeParse(wsMessage);

            if (!validation?.success) {
                console.log('displayQuestionResults validation failed');
                return;
            }

            const party = await PartyPoolManager.getPartyById(wsMessage.id);

            if (!party) {
                return console.log('party not found');
            }

            if (party.host !== ws.id) {
                return console.log('You are not the host');
            }

            const questionAnswers = await party.answerModel.getQuestionAnswers(
                wsMessage.id,
                Number(wsMessage.message.question)
            );

            const partyPlayers = await party.partyModel.getAllPartyPlayerIds(
                wsMessage.id,
                party.participantModel
            );

            for (const player of partyPlayers) {
                sendMessage(
                    WebSocketManager.getWebSocketSession(player),
                    WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS,
                    party.id,
                    {
                        questionAnswers,
                    }
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
    export async function answerQuestion(ws: ExtWebSocket, wsMessage: AnswerQuestionMessage) {
        const validation = answerQuestionSchema.safeParse(wsMessage);

        if (!validation?.success) {
            console.log('displayQuestionResults validation failed');
            return;
        }

        const party = await PartyPoolManager.getPartyById(wsMessage.id);

        if (!party) {
            return console.log('party not found');
        }

        await party.answerModel.addAnswer(
            party.id,
            ws.id,
            wsMessage.message.question,
            wsMessage.message.answer,
            wsMessage.message.is_correct
        );

        sendMessage(
            WebSocketManager.getWebSocketSession(party.host),
            WebSocketMessageEvent.ANSWER_QUESTION,
            party.id,
            {
                participant_answered: true,
            }
        );
    }
}
