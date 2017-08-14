<?php

namespace Remp\MailerModule;

use Nette\Database\IRow;
use Nette\Mail\Message;
use Nette\Utils\Json;
use Remp\MailerModule\Repository\LogsRepository;
use Remp\MailerModule\Repository\UserSubscriptionsRepository;
use Remp\MailerModule\Sender\ContentGenerator;
use Remp\MailerModule\Sender\MailerFactory;

class Sender
{
    /** @var array */
    private $recipient;

    /** @var IRow */
    private $template;

    /** @var  array */
    private $params = [];

    /** @var  array */
    private $attachments = [];

    /** @var MailerFactory */
    private $mailerFactory;

    /** @var UserSubscriptionsRepository */
    private $userSubscriptionsRepository;

    /** @var LogsRepository */
    private $logsRepository;

    public function __construct(
        MailerFactory $mailerFactory,
        UserSubscriptionsRepository $userSubscriptionsRepository,
        LogsRepository $logsRepository
    ) {
        $this->mailerFactory = $mailerFactory;
        $this->userSubscriptionsRepository = $userSubscriptionsRepository;
        $this->logsRepository = $logsRepository;
    }

    public function setRecipient($email, $name = null)
    {
        $this->recipient = [
            'email' => $email,
            'name' => $name,
        ];

        return $this;
    }

    public function addAttachment($name, $content = null)
    {
        $this->attachments[$name] = $content;

        return $this;
    }

    public function setTemplate(IRow $template)
    {
        $this->template = $template;

        return $this;
    }

    public function setParams($params)
    {
        $this->params = $params;

        return $this;
    }

    public function send($checkUserSubscribed = true)
    {
        if ($checkUserSubscribed && $this->userSubscriptionsRepository->isEmailUnSubscribed($this->recipient['email'], $this->template->mail_type->id)) {
            return false;
        }

        $message = new Message();
        $message->addTo($this->recipient['email'], $this->recipient['name']);
        $message->setFrom($this->template->from);
        $message->setSubject($this->template->subject);

        $generator = new ContentGenerator($this->template, $this->template->layout);
        if ($this->template->mail_body_text) {
            $message->setBody($generator->getTextBody($this->params));
        }

        if ($this->template->mail_body_html) {
            $message->setHtmlBody($generator->getHtmlBody($this->params));
        }

        $attachmentSize = null;
        foreach ($this->attachments as $name => $content) {
            $message->addAttachment($name, $content);
            $attachmentSize += strlen($content);
        }

        $senderId = md5($this->recipient['email'] . microtime(true));

        $message->setHeader('X-Mailer-Variables', Json::encode([
            'tag' => $this->template->code,
            'sender_id' => $senderId,
        ]));

        $this->logsRepository->add($this->recipient['email'], $this->template->subject, $this->template->id, $senderId, $attachmentSize);

        $this->mailerFactory->getMailer()->send($message);
        $this->reset();

        return true;
    }

    private function reset()
    {
        $this->recipient = null;
        $this->template = null;
        $this->params = [];
        $this->attachments = [];
    }
}
