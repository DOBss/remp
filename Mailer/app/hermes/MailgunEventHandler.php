<?php

namespace Remp\MailerModule\Hermes;

use Nette\Utils\DateTime;
use Remp\MailerModule\Repository\LogsRepository;
use Tomaj\Hermes\Handler\HandlerInterface;
use Tomaj\Hermes\MessageInterface;

class MailgunEventHandler implements HandlerInterface
{
    private $logsRepository;

    public function __construct(
        LogsRepository $logsRepository
    ) {
        $this->logsRepository = $logsRepository;
    }

    public function handle(MessageInterface $message)
    {
        $payload = $message->getPayload();
        if (!isset($payload['mail_sender_id'])) {
            throw new HermesException('unable to handle event: mail_sender_id is missing');
        }
        if (!isset($payload['timestamp'])) {
            throw new HermesException('unable to handle event: timestamp is missing');
        }
        if (!isset($payload['event'])) {
            throw new HermesException('unable to handle event: event is missing');
        }

        $log = $this->logsRepository->findBySenderId($payload['mail_sender_id']);
        if (!$log) {
            return false;
        }

        $date = DateTime::from($payload['timestamp']);

        $mailgunEvent = $this->logsRepository->mapEvent($payload['event']);
        if (!$mailgunEvent) {
            return false;
        }

        $this->logsRepository->update($log, [
            $mailgunEvent => $date,
            'updated_at' => new DateTime(),
        ]);

        return true;
    }
}
