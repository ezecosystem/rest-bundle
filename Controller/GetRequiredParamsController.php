<?php

namespace xrow\restBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;

class GetRequiredParamsController extends Controller
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getClientParamsAction(Request $request)
    {
        $client_id = $this->container->getParameter('oauth2_client_id');
        $client_secret = $this->container->getParameter('oauth2_client_secret');
        return new JsonResponse(array(
                'client_id' => $client_id,
                'client_secret' => $client_secret));
    }
}